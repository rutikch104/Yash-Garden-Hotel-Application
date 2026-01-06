import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

function TableBilling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [items, setItems] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const [billData, setBillData] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [portion, setPortion] = useState('full');
  const [quantity, setQuantity] = useState(1);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showViewBillModal, setShowViewBillModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editItemPrice, setEditItemPrice] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState('add'); // 'add' or 'cancel'
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const searchInputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    fetchTable();
    fetchItems();
  }, [id]);

  useEffect(() => {
    if (table) {
      if (table.status === 'closed') {
        fetchBillForTable();
      } else {
        fetchTableItems();
      }
    }
  }, [table]);

  const fetchTable = async () => {
    try {
      const response = await fetch(`/api/tables/${id}`);
      const data = await response.json();
      setTable(data);
    } catch (error) {
      console.error('Error fetching table:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchTableItems = async () => {
    try {
      const response = await fetch(`/api/tables/${id}/items`);
      const data = await response.json();
      setTableItems(data);
    } catch (error) {
      console.error('Error fetching table items:', error);
    }
  };

  const fetchBillForTable = async () => {
    setLoadingBill(true);
    try {
      const response = await fetch(`/api/bills/table/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Bill data received:', data); // Debug log
        setBillData(data);
        
        // Handle items - they might be a string or array
        let itemsArray = [];
        if (data.items) {
          if (typeof data.items === 'string') {
            try {
              itemsArray = JSON.parse(data.items);
            } catch (e) {
              console.error('Error parsing items string:', e);
              itemsArray = [];
            }
          } else if (Array.isArray(data.items)) {
            itemsArray = data.items;
          }
        }
        
        console.log('Items array:', itemsArray); // Debug log
        
        // Convert bill items to table items format for display
        if (itemsArray && itemsArray.length > 0) {
          const formattedItems = itemsArray.map((item, idx) => ({
            id: idx + 1,
            item_id: item.item_id || item.itemId || '',
            item_name: item.item_name || item.itemName || 'Unknown Item',
            portion: item.portion || 'full',
            quantity: item.quantity || 1,
            price: item.price || 0,
            created_at: data.created_at
          }));
          console.log('Formatted items:', formattedItems); // Debug log
          setTableItems(formattedItems);
        } else {
          console.log('No items found in bill');
          setTableItems([]);
        }
        
        // Set payment status and method from bill
        if (data.payment_status) setPaymentStatus(data.payment_status);
        if (data.payment_method) setPaymentMethod(data.payment_method);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        // If no bill found, clear items
        setTableItems([]);
        setBillData(null);
      }
    } catch (error) {
      console.error('Error fetching bill for table:', error);
      setTableItems([]);
      setBillData(null);
    } finally {
      setLoadingBill(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return false;
    const search = searchTerm.toLowerCase().trim();
    return (
      item.item_id.toLowerCase().includes(search) ||
      item.item_name.toLowerCase().includes(search)
    );
  });

  // Function to add item to table (extracted for reuse)
  const addItemDirectly = async (item) => {
    if (!item) return;

    // Prevent adding items to closed tables
    if (isClosed) {
      alert('Cannot add items to a closed table. Please reopen the table to make changes.');
      return;
    }

    try {
      if (isClosed && billData) {
        const price = item.full_price;
        const quantityToAdd = 1;
        
        const existingItemIndex = tableItems.findIndex(
          tableItem => tableItem.item_id === item.item_id && tableItem.portion === 'full'
        );
        
        if (existingItemIndex !== -1) {
          const existingItem = tableItems[existingItemIndex];
          setDuplicateItem({
            ...existingItem,
            newQuantity: quantityToAdd,
            pricePerUnit: price
          });
          setShowDuplicateModal(true);
          setSelectedItem(item);
          setSearchTerm('');
          return;
        }
        
        const totalPrice = price * quantityToAdd;
        const newItem = {
          id: Date.now(),
          item_id: item.item_id,
          item_name: item.item_name,
          portion: 'full',
          quantity: quantityToAdd,
          price: totalPrice
        };
        
        const updatedItems = [...tableItems, newItem];
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map(item => ({
              item_id: item.item_id,
              item_name: item.item_name,
              portion: item.portion,
              quantity: item.quantity,
              price: item.price
            })),
            total_amount: newTotal
          }),
        });

        if (response.ok) {
          setSearchTerm('');
          await fetchBillForTable();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add item');
        }
      } else {
        const existingItem = tableItems.find(
          tableItem => {
            const itemCode = tableItem.item_code || tableItem.item_id;
            return itemCode === item.item_id && tableItem.portion === 'full';
          }
        );
        
        if (existingItem) {
          setDuplicateItem({
            ...existingItem,
            newQuantity: 1,
            pricePerUnit: item.full_price
          });
          setShowDuplicateModal(true);
          setSelectedItem(item);
          setSearchTerm('');
          return;
        }
        
        const response = await fetch(`/api/tables/${id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: item.id,
            portion: 'full',
            quantity: 1,
          }),
        });

        if (response.ok) {
          setSearchTerm('');
          fetchTableItems();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add item');
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const addItemToTable = async () => {
    if (!selectedItem) return;

    try {
      if (isClosed && billData) {
        // Add item to closed table bill
        const price = portion === 'half' ? selectedItem.half_price : selectedItem.full_price;
        const quantityToAdd = parseInt(quantity);
        
        // Check if the same item with same portion already exists
        const existingItemIndex = tableItems.findIndex(
          item => item.item_id === selectedItem.item_id && item.portion === portion
        );
        
        if (existingItemIndex !== -1) {
          // Show duplicate confirmation modal
          const existingItem = tableItems[existingItemIndex];
          setDuplicateItem({
            ...existingItem,
            newQuantity: quantityToAdd,
            pricePerUnit: price
          });
          setShowDuplicateModal(true);
          return;
        }
        
        // Add new item (no duplicate)
        const totalPrice = price * quantityToAdd;
        const newItem = {
          id: Date.now(),
          item_id: selectedItem.item_id,
          item_name: selectedItem.item_name,
          portion,
          quantity: quantityToAdd,
          price: totalPrice
        };
        
        const updatedItems = [...tableItems, newItem];
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map(item => ({
              item_id: item.item_id,
              item_name: item.item_name,
              portion: item.portion,
              quantity: item.quantity,
              price: item.price
            })),
            total_amount: newTotal
          }),
        });

        if (response.ok) {
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          await fetchBillForTable();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add item');
        }
      } else {
        // Add item to open table - check for duplicates first
        // For open tables, items have item_code (from backend) which matches selectedItem.item_id
        const existingItem = tableItems.find(
          item => {
            const itemCode = item.item_code || item.item_id;
            return itemCode === selectedItem.item_id && item.portion === portion;
          }
        );
        
        if (existingItem) {
          // Show duplicate confirmation modal
          const pricePerUnit = portion === 'half' ? selectedItem.half_price : selectedItem.full_price;
          setDuplicateItem({
            ...existingItem,
            newQuantity: parseInt(quantity),
            pricePerUnit: pricePerUnit
          });
          setShowDuplicateModal(true);
          return;
        }
        
        // Add new item (no duplicate)
        const response = await fetch(`/api/tables/${id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: selectedItem.id,
            portion,
            quantity: parseInt(quantity),
          }),
        });

        if (response.ok) {
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          fetchTableItems();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add item');
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const handleDuplicateAction = async (action) => {
    if (!duplicateItem || !selectedItem) return;
    
    // Use the portion from duplicateItem (existing item's portion) since we're auto-adding with 'full'
    const itemPortion = duplicateItem.portion || portion;
    
    try {
      if (isClosed && billData) {
        const existingItemIndex = tableItems.findIndex(
          item => item.item_id === selectedItem.item_id && item.portion === itemPortion
        );
        
        if (existingItemIndex === -1) return;
        
        const existingItem = tableItems[existingItemIndex];
        const price = itemPortion === 'half' ? selectedItem.half_price : selectedItem.full_price;
        let newQuantity;
        
        if (action === 'add') {
          newQuantity = existingItem.quantity + duplicateItem.newQuantity;
        } else if (action === 'decrease') {
          newQuantity = Math.max(1, existingItem.quantity - duplicateItem.newQuantity);
        } else {
          // Cancel
          setShowDuplicateModal(false);
          setDuplicateItem(null);
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          return;
        }
        
        const newPrice = price * newQuantity;
        const updatedItems = [...tableItems];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          price: newPrice
        };
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map(item => ({
              item_id: item.item_id,
              item_name: item.item_name,
              portion: item.portion,
              quantity: item.quantity,
              price: item.price
            })),
            total_amount: newTotal
          }),
        });

        if (response.ok) {
          setShowDuplicateModal(false);
          setDuplicateItem(null);
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          await fetchBillForTable();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update item');
        }
      } else {
        // Open table - use the portion from duplicateItem (existing item's portion)
        const itemPortion = duplicateItem.portion || portion;
        const existingItem = tableItems.find(
          item => {
            const itemCode = item.item_code || item.item_id;
            return itemCode === selectedItem.item_id && item.portion === itemPortion;
          }
        );
        
        if (!existingItem) {
          // Item not found, cancel
          setShowDuplicateModal(false);
          setDuplicateItem(null);
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          return;
        }
        
        const price = itemPortion === 'half' ? selectedItem.half_price : selectedItem.full_price;
        let newQuantity;
        
        if (action === 'add') {
          newQuantity = existingItem.quantity + duplicateItem.newQuantity;
        } else if (action === 'decrease') {
          newQuantity = Math.max(1, existingItem.quantity - duplicateItem.newQuantity);
        } else {
          // Cancel
          setShowDuplicateModal(false);
          setDuplicateItem(null);
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          return;
        }
        
        const newPrice = price * newQuantity;
        
        const response = await fetch(`/api/tables/${id}/items/${existingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: newQuantity,
            price: newPrice
          }),
        });

        if (response.ok) {
          setShowDuplicateModal(false);
          setDuplicateItem(null);
          setSelectedItem(null);
          setPortion('full');
          setQuantity(1);
          setSearchTerm('');
          fetchTableItems();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update item');
        }
      }
    } catch (error) {
      console.error('Error handling duplicate action:', error);
      alert('Failed to update item');
    }
  };

  const updateItemPortion = async (item, newPortion, isClosedTable = false) => {
    if (newPortion === item.portion) return; // No change needed
    
    // Prevent editing items in closed tables
    if (isClosedTable) {
      alert('Cannot modify items in a closed table. Please reopen the table to make changes.');
      return;
    }
    
    try {
      // Find the original item data to get half_price and full_price
      const originalItem = items.find(i => 
        i.item_id === (item.item_id || item.item_code)
      );
      
      if (!originalItem) {
        alert('Item data not found. Please refresh the page.');
        return;
      }
      
      // Check if item supports both portions (if half_price === full_price, only one portion available)
      if (originalItem.half_price === originalItem.full_price && newPortion === 'half') {
        alert('This item only has one size available.');
        return;
      }
      
      const newPricePerUnit = newPortion === 'half' ? originalItem.half_price : originalItem.full_price;
      const currentQuantity = item.quantity || 1;
      const newPrice = newPricePerUnit * currentQuantity;
      
      if (isClosedTable && billData) {
        const itemIndex = tableItems.findIndex(i => 
          (i.item_id === item.item_id || i.item_code === item.item_code) && 
          i.portion === item.portion
        );
        
        if (itemIndex === -1) {
          console.error('Item not found in tableItems');
          return;
        }
        
        const updatedItems = [...tableItems];
        updatedItems[itemIndex] = {
          ...item,
          portion: newPortion,
          price: newPrice
        };
        
        const newTotal = updatedItems.reduce((sum, i) => sum + (i.price || 0), 0);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map(i => ({
              item_id: i.item_id || i.item_code,
              item_name: i.item_name,
              portion: i.portion,
              quantity: i.quantity,
              price: i.price
            })),
            total_amount: newTotal
          }),
        });

        if (response.ok) {
          await fetchBillForTable();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update portion');
        }
      } else {
        // For open tables
        const response = await fetch(`/api/tables/${id}/items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portion: newPortion,
            price: newPrice
          }),
        });

        if (response.ok) {
          fetchTableItems();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update portion');
        }
      }
    } catch (error) {
      console.error('Error updating portion:', error);
      alert('Failed to update portion');
    }
  };

  const updateItemQuantity = async (item, newQuantity, isClosedTable = false) => {
    // Prevent editing items in closed tables
    if (isClosedTable) {
      alert('Cannot modify items in a closed table. Please reopen the table to make changes.');
      return;
    }
    
    if (newQuantity < 1) {
      // If quantity would be less than 1, remove the item instead
      removeItem(item.id);
      return;
    }
    
    try {
      if (isClosedTable && billData) {
        const itemIndex = tableItems.findIndex(i => 
          (i.item_id === item.item_id || i.item_code === item.item_code) && i.portion === item.portion
        );
        
        if (itemIndex === -1) {
          console.error('Item not found in tableItems');
          return;
        }
        
        // For closed tables, calculate unit price from current price and quantity
        // Since bill items don't have half_price/full_price stored
        const currentQuantity = item.quantity || 1;
        const currentPrice = item.price || 0;
        const unitPrice = currentQuantity > 0 ? currentPrice / currentQuantity : 0;
        const newPrice = unitPrice * newQuantity;
        
        const updatedItems = [...tableItems];
        updatedItems[itemIndex] = {
          ...item,
          quantity: newQuantity,
          price: newPrice
        };
        
        const newTotal = updatedItems.reduce((sum, i) => sum + (i.price || 0), 0);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map(i => ({
              item_id: i.item_id || i.item_code,
              item_name: i.item_name,
              portion: i.portion,
              quantity: i.quantity,
              price: i.price
            })),
            total_amount: newTotal
          }),
        });

        if (response.ok) {
          await fetchBillForTable();
        }
      } else {
        // For open tables, use half_price/full_price from item
        const price = item.portion === 'half' ? (item.half_price || 0) : (item.full_price || 0);
        const newPrice = price * newQuantity;
        
        const response = await fetch(`/api/tables/${id}/items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: newQuantity,
            price: newPrice
          }),
        });

        if (response.ok) {
          fetchTableItems();
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (itemIdOrIndex) => {
    // Prevent removing items from closed tables
    if (isClosed) {
      alert('Cannot remove items from a closed table. Please reopen the table to make changes.');
      return;
    }
    
    try {
      if (isClosed && billData) {
        if (!billData.id) {
          alert('Bill ID not found. Please refresh the page.');
          return;
        }

        // Remove item from closed table bill using index
        const itemIndex = typeof itemIdOrIndex === 'number' ? itemIdOrIndex : parseInt(itemIdOrIndex);
        
        if (itemIndex < 0 || itemIndex >= tableItems.length) {
          alert('Invalid item index');
          return;
        }
        
        // Create new array without the removed item
        const updatedItems = tableItems.filter((_, idx) => idx !== itemIndex);
        
        if (updatedItems.length === tableItems.length) {
          alert('Item not found');
          return;
        }
        
        const newTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        
        const billItemsData = updatedItems.map(item => ({
          item_id: item.item_id || '',
          item_name: item.item_name || 'Unknown',
          portion: item.portion || 'full',
          quantity: parseInt(item.quantity || 1),
          price: parseFloat(item.price || 0)
        }));
        
        console.log('Removing item at index:', itemIndex);
        console.log('Bill ID:', billData.id);
        console.log('Updated items:', billItemsData);
        console.log('New total:', newTotal);
        
        const response = await fetch(`/api/bills/${billData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: billItemsData,
            total_amount: newTotal
          }),
        });

        const responseData = await response.json().catch(() => ({}));
        
        if (response.ok) {
          await fetchBillForTable();
          alert('Item removed successfully!');
        } else {
          console.error('Error response:', responseData);
          alert(responseData.error || 'Failed to remove item. Check console for details.');
        }
      } else {
        // Remove item from open table
        const response = await fetch(`/api/tables/${id}/items/${itemIdOrIndex}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTableItems();
        } else {
          const error = await response.json().catch(() => ({ error: 'Failed to remove item' }));
          alert(error.error || 'Failed to remove item');
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item: ' + (error.message || 'Unknown error'));
    }
  };

  const calculateTotal = () => {
    return tableItems.reduce((sum, item) => sum + item.price, 0);
  };

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    const billContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${table?.table_number}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
              @page { margin: 0; size: 80mm auto; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 72mm;
              width: 72mm;
              margin: 0 auto;
              padding: 4mm;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .header h1 {
              margin: 0;
              color: #000;
              font-size: 16px;
              font-weight: bold;
            }
            .bill-info {
              margin-bottom: 6px;
              font-size: 10px;
              line-height: 1.3;
            }
            .bill-info p {
              margin: 1px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
              font-size: 10px;
            }
            th, td {
              padding: 2px 3px;
              text-align: left;
              border-bottom: 1px dotted #999;
            }
            th {
              background: #000;
              color: #fff;
              font-size: 9px;
              font-weight: bold;
              padding: 3px 3px;
            }
            td {
              font-size: 10px;
              word-wrap: break-word;
            }
            .total {
              text-align: right;
              font-size: 16px;
              font-weight: bold;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 2px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 6px;
              padding-top: 6px;
              border-top: 1px dotted #999;
              color: #000;
              font-size: 9px;
            }
            button {
              background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              margin: 10px 5px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YASH GARDEN</h1>
            <p style="margin-top: 2px; font-size: 9px; line-height: 1.2;">
              Gurgawale Rd, Chopda, Jalgaon - 425107<br/>
              Ph: +91 7038603339 | +91 9422103339
            </p>
            <p style="margin-top: 2px; font-size: 10px; font-weight: bold;">BILL RECEIPT</p>
          </div>
          <div class="bill-info">
            <p><strong>Table:</strong> ${table?.table_number} | <strong>Bill:</strong> ${billData ? `#${billData.id}` : 'Pending'}</p>
            <p><strong>Date:</strong> ${billData ? new Date(billData.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            ${billData?.customer_name ? `<p><strong>Customer:</strong> ${billData.customer_name}</p>` : ''}
            ${billData?.customer_phone ? `<p><strong>Phone:</strong> ${billData.customer_phone}</p>` : ''}
            <p><strong>Status:</strong> ${billData ? billData.payment_status.toUpperCase() : paymentStatus.toUpperCase()} | <strong>Pay:</strong> ${billData ? billData.payment_method.toUpperCase() : paymentMethod.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 12%; text-align: center;">P</th>
                <th style="width: 13%; text-align: center;">Qty</th>
                <th style="width: 30%; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${tableItems.map(item => `
                <tr>
                  <td style="word-break: break-word;">${item.item_name}</td>
                  <td style="text-align: center;">${item.portion.toUpperCase()}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ₹${calculateTotal().toFixed(2)}
          </div>
          <div class="footer">
            <p>Thank you for your visit!</p>
          </div>
          <div class="no-print" style="text-align: center;">
            <button onclick="window.print()">🖨️ Print Bill</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(billContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const generateBill = async () => {
    // Validate required fields for pending bills
    if (paymentStatus === 'pending') {
      if (!customerName.trim()) {
        alert('Customer name is required for pending bills. Please enter the customer name.');
        return;
      }
      if (!customerPhone.trim()) {
        alert('Customer phone number is required for pending bills. Please enter the customer phone number.');
        return;
      }
    }

    const total = calculateTotal();
    const billItems = tableItems.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      portion: item.portion,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: parseInt(id),
          table_number: table.table_number,
          total_amount: total,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          items: billItems,
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
        }),
      });

      if (response.ok) {
        alert('Bill generated successfully!');
        navigate('/');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate bill');
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Failed to generate bill');
    }
  };

  if (!table) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '20px',
        color: '#667eea',
        fontWeight: '600'
      }}>
        <div className="loading">⏳ Loading...</div>
      </div>
    );
  }

  const isClosed = table.status === 'closed';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
          }}>
            🧾 {table.table_number} - Billing
          </h2>
          {isClosed && (
            <div style={{ 
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🔴 Table Closed - View Only
            </div>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
        overflow: 'visible'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            🔍 {isClosed ? 'View Bill Items' : 'Add Items'}
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {isClosed ? 'Table is closed. Items cannot be modified. Reopen the table to make changes.' : 'Search for items to add to the table'}
          </p>
        </div>
        {isClosed ? (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '2px solid #ffc107',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#856404'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              This table is closed. Items cannot be added, edited, or removed.
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
              To modify items, please reopen the table first.
            </p>
          </div>
        ) : (
          <div className="search-box" style={{ position: 'relative', zIndex: 9999 }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="🔎 Search by Item ID or Name... (Press Enter to add first result)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Update dropdown position
                if (searchInputRef.current) {
                  const rect = searchInputRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredItems.length > 0) {
                  e.preventDefault();
                  // Add the first matching item
                  addItemDirectly(filteredItems[0]);
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.15), 0 6px 20px rgba(37, 99, 235, 0.25)';
                e.target.style.transform = 'translateY(-2px)';
                // Update dropdown position
                if (searchInputRef.current) {
                  const rect = searchInputRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                  });
                }
              }}
              style={{
                width: '100%',
                padding: '18px 50px 18px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '14px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                fontWeight: '500'
              }}
              onBlur={(e) => {
                // Delay blur to allow click on dropdown items
                setTimeout(() => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.target.style.transform = 'translateY(0)';
                }, 200);
              }}
            />
            <div style={{
              position: 'absolute',
              right: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              pointerEvents: 'none'
            }}>
              🔍
            </div>

            {/* Dropdown Results - Rendered via Portal */}
            {searchTerm && filteredItems.length > 0 && createPortal(
            <div style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              background: 'white',
              border: '2px solid #2563eb',
              borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
              maxHeight: '350px',
              overflowY: 'auto',
              zIndex: 9999
            }}>
              <div style={{
                padding: '10px 18px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found • Press Enter to add first
              </div>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => addItemDirectly(item)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: index < filteredItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f4ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e40af',
                      marginBottom: '4px'
                    }}>
                      {item.item_name}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b'
                    }}>
                      {item.item_id} • Half: ₹{item.half_price} • Full: ₹{item.full_price}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#2563eb',
                    marginLeft: '12px'
                  }}>
                    ➕
                  </div>
                </div>
              ))}
            </div>,
            document.body
          )}

            {/* No Results - Rendered via Portal */}
            {searchTerm && filteredItems.length === 0 && createPortal(
            <div style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              padding: '20px',
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 9999,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <p style={{ color: '#856404', fontWeight: '500', fontSize: '14px' }}>
                No items found matching "{searchTerm}"
              </p>
            </div>,
            document.body
          )}
          </div>
        )}
      </div>

      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ 
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '24px',
              marginBottom: '5px'
            }}>
              {isClosed ? '📋 Bill Items (Closed Table)' : '📝 Current Bill Items'}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {isClosed ? 'View and edit items in the closed bill' : 'Items added to this table'}
            </p>
          </div>
          {tableItems.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              {tableItems.length} {tableItems.length === 1 ? 'Item' : 'Items'}
            </div>
          )}
        </div>
        
        {isClosed && loadingBill && (
          <div className="empty-state">
            <div className="loading" style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
            <p>Loading bill information...</p>
          </div>
        )}
        
        {isClosed && !loadingBill && !billData && (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
            <p>No bill found for this closed table.</p>
          </div>
        )}
        
        {tableItems.length === 0 && (!isClosed || billData) ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
            <p>
              {isClosed 
                ? 'No items were found in this bill.' 
                : 'No items added yet. Search and add items above!'
              }
            </p>
          </div>
        ) : tableItems.length > 0 ? (
          <div className="items-list">
            {tableItems.map((item, index) => (
              <div key={item.id || index} className="item-row" style={isClosed ? { 
                opacity: 0.9,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e0e0e0'
              } : {}}>
                <div className="item-info">
                  <h4>
                    {item.item_name || 'Unknown Item'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => updateItemQuantity(item, (item.quantity || 1) - 1, isClosed)}
                        disabled={(item.quantity || 1) <= 1}
                        style={{
                          minWidth: '28px',
                          padding: '3px 6px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: (item.quantity || 1) <= 1 ? 'not-allowed' : 'pointer',
                          opacity: (item.quantity || 1) <= 1 ? 0.5 : 1,
                          border: 'none',
                          background: (item.quantity || 1) <= 1 ? 'rgba(0,0,0,0.1)' : 'rgba(37, 99, 235, 0.2)',
                          color: (item.quantity || 1) <= 1 ? '#999' : '#2563eb',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        title="Decrease Quantity"
                        onMouseEnter={(e) => {
                          if ((item.quantity || 1) > 1) {
                            e.target.style.background = 'rgba(37, 99, 235, 0.3)';
                            e.target.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((item.quantity || 1) > 1) {
                            e.target.style.background = 'rgba(37, 99, 235, 0.2)';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        −
                      </button>
                      <span style={{ 
                        minWidth: '24px', 
                        textAlign: 'center', 
                        fontWeight: '700',
                        fontSize: '14px',
                        color: '#2563eb'
                      }}>
                        {item.quantity || 1}
                      </span>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => updateItemQuantity(item, (item.quantity || 1) + 1, isClosed)}
                        style={{
                          minWidth: '28px',
                          padding: '3px 6px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          background: 'rgba(37, 99, 235, 0.3)',
                          color: '#2563eb',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        title="Increase Quantity"
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(37, 99, 235, 0.4)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(37, 99, 235, 0.3)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {item.portion ? item.portion.toUpperCase() : 'FULL'} × {item.quantity || 1} = ₹{(item.price || 0).toFixed(2)}
                    </span>
                    {/* Portion Toggle Button - Only for open tables */}
                    {!isClosed && (() => {
                      const originalItem = items.find(i => i.item_id === (item.item_id || item.item_code));
                      const hasDifferentPrices = originalItem && originalItem.half_price !== originalItem.full_price;
                      const currentPortion = item.portion || 'full';
                      const canToggle = hasDifferentPrices && originalItem;
                      
                      if (!canToggle) return null;
                      
                      return (
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => {
                            const newPortion = currentPortion === 'full' ? 'half' : 'full';
                            updateItemPortion(item, newPortion, isClosed);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '6px',
                            border: '1px solid rgba(37, 99, 235, 0.3)',
                            background: currentPortion === 'half' 
                              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                              : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            color: currentPortion === 'half' ? '#92400e' : '#1e40af',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginLeft: '8px'
                          }}
                          title={`Switch to ${currentPortion === 'full' ? 'Half' : 'Full'} (₹${currentPortion === 'full' ? originalItem.half_price : originalItem.full_price})`}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {currentPortion === 'full' ? '⬇️ Half' : '⬆️ Full'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
                <div className="item-actions">
                  {isClosed ? (
                    <div style={{ 
                      padding: '6px 12px',
                      background: 'rgba(108, 117, 125, 0.1)',
                      borderRadius: '6px',
                      color: '#6c757d',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      🔒 Locked
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          setEditingItemIndex(index);
                          setEditItemPrice(item.price || 0);
                          setShowEditModal(true);
                        }}
                        title="Edit Price"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => removeItem(item.id)}
                        title="Remove Item"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tableItems.length > 0 && (
          <div className="total-section">
            <h2>Total: ₹{calculateTotal().toFixed(2)}</h2>
            {!isClosed && (
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={printBill}
                  style={{ flex: 1, minWidth: '150px', padding: '12px 30px', fontSize: '16px' }}
                >
                  🖨️ Print Preview
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setShowBillModal(true)}
                  style={{ flex: 1, minWidth: '150px', padding: '12px 30px', fontSize: '16px', fontWeight: '700' }}
                >
                  💰 Generate Bill
                </button>
              </div>
            )}
            {isClosed && billData && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    // Save changes to bill
                    const billItems = tableItems.map((item) => ({
                      item_id: item.item_id,
                      item_name: item.item_name,
                      portion: item.portion,
                      quantity: item.quantity,
                      price: item.price,
                    }));
                    const total = calculateTotal();
                    
                    try {
                      const response = await fetch(`/api/bills/${billData.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: billItems,
                          total_amount: total,
                          payment_status: paymentStatus,
                          payment_method: paymentMethod
                        }),
                      });
                      
                      if (response.ok) {
                        await fetchBillForTable();
                        alert('Bill updated successfully!');
                      } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to update bill');
                      }
                    } catch (error) {
                      console.error('Error updating bill:', error);
                      alert('Failed to update bill');
                    }
                  }}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  💾 Save Changes
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowViewBillModal(true)}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  👁️ View Bill Details
                </button>
                <button
                  className="btn btn-success"
                  onClick={printBill}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  🖨️ Print Bill
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to reopen this table? Items from the bill will be restored to the table.')) {
                      try {
                        const response = await fetch(`/api/tables/${id}/reopen`, {
                          method: 'PUT',
                        });
                        
                        if (response.ok) {
                          alert('Table reopened successfully! Items have been restored.');
                          // Refresh table data to show restored items
                          await fetchTable();
                          // The useEffect will automatically fetch table items since status is now 'open'
                        } else {
                          const error = await response.json();
                          alert(error.error || 'Failed to reopen table');
                        }
                      } catch (error) {
                        console.error('Error reopening table:', error);
                        alert('Failed to reopen table');
                      }
                    }
                  }}
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  🔓 Reopen Table
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showBillModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Final Bill</h2>
              <button className="close-btn" onClick={() => setShowBillModal(false)}>
                ×
              </button>
            </div>

            <div className="bill-summary">
              <h3>Items:</h3>
              {tableItems.map((item) => (
                <div key={item.id} className="bill-item">
                  <div>
                    <strong>{item.item_name}</strong> - {item.portion.toUpperCase()} × {item.quantity}
                  </div>
                  <div>₹{item.price.toFixed(2)}</div>
                </div>
              ))}
              <div className="bill-item" style={{ borderTop: '2px solid #2563eb', paddingTop: '15px', marginTop: '15px' }}>
                <div><strong>Total Amount:</strong></div>
                <div><strong>₹{calculateTotal().toFixed(2)}</strong></div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>
                Customer Name {paymentStatus === 'pending' && <span style={{ color: '#dc3545' }}>*</span>}
                {paymentStatus !== 'pending' && <span style={{ color: '#666', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}
              </label>
              <input
                type="text"
                placeholder={paymentStatus === 'pending' ? 'Enter customer name (Required)' : 'Enter customer name'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required={paymentStatus === 'pending'}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: paymentStatus === 'pending' && !customerName.trim() ? '2px solid #dc3545' : '2px solid #e0e0e0'
                }}
              />
            </div>

            <div className="form-group">
              <label>
                Customer Phone {paymentStatus === 'pending' && <span style={{ color: '#dc3545' }}>*</span>}
                {paymentStatus !== 'pending' && <span style={{ color: '#666', fontSize: '12px', fontWeight: 'normal' }}> (Optional)</span>}
              </label>
              <input
                type="tel"
                placeholder={paymentStatus === 'pending' ? 'Enter phone number (Required)' : 'Enter phone number'}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required={paymentStatus === 'pending'}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: paymentStatus === 'pending' && !customerPhone.trim() ? '2px solid #dc3545' : '2px solid #e0e0e0'
                }}
              />
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <select value={paymentStatus} onChange={(e) => {
                setPaymentStatus(e.target.value);
                // Clear customer fields when switching to paid (they're only required for pending)
                if (e.target.value === 'paid') {
                  // Keep the values but remove requirement
                }
              }}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              {paymentStatus === 'pending' && (
                <p style={{ marginTop: '8px', color: '#dc3545', fontSize: '13px', fontStyle: 'italic' }}>
                  ⚠️ Customer name and phone are required for pending bills
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowBillModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={generateBill} style={{ flex: 1 }}>
                Submit Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewBillModal && billData && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>📄 Bill Details - {table.table_number}</h2>
              <button className="close-btn" onClick={() => setShowViewBillModal(false)}>
                ×
              </button>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Bill ID</strong>
                  <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: '600' }}>#{billData.id}</p>
                </div>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Table</strong>
                  <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: '600' }}>{billData.table_number}</p>
                </div>
                {billData.customer_name && (
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Customer Name</strong>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: '600' }}>{billData.customer_name}</p>
                  </div>
                )}
                {billData.customer_phone && (
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Phone</strong>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: '600' }}>{billData.customer_phone}</p>
                  </div>
                )}
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Date & Time</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>{new Date(billData.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Payment Status</strong>
                  <p style={{ margin: '5px 0' }}>
                    <span className={`status-badge status-${billData.payment_status}`}>
                      {billData.payment_status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Payment Method</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: '600' }}>{billData.payment_method.toUpperCase()}</p>
                </div>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Total Amount</strong>
                  <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>₹{billData.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bill-summary">
              <h3 style={{ marginBottom: '15px' }}>Items Ordered:</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Portion</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {tableItems.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.item_name}</strong></td>
                      <td>{item.portion.toUpperCase()}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8f9fa', fontWeight: '700' }}>
                    <td colSpan="3" style={{ textAlign: 'right', padding: '15px' }}>Total:</td>
                    <td style={{ textAlign: 'right', padding: '15px', fontSize: '18px', color: '#2563eb' }}>₹{calculateTotal().toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                onClick={printBill} 
                style={{ flex: 1, minWidth: '150px' }}
              >
                🖨️ Print Bill
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowViewBillModal(false)} 
                style={{ flex: 1, minWidth: '150px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDuplicateModal && duplicateItem && selectedItem && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>⚠️ Item Already Exists</h2>
              <button className="close-btn" onClick={() => {
                setShowDuplicateModal(false);
                setDuplicateItem(null);
                setSelectedItem(null);
                setPortion('full');
                setQuantity(1);
                setSearchTerm('');
              }}>
                ×
              </button>
            </div>

            <div style={{ 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px solid rgba(255, 193, 7, 0.3)'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>{duplicateItem.item_name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px' }}>Current Quantity</strong>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: '5px 0' }}>
                    {duplicateItem.quantity}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#666', fontSize: '12px' }}>Adding Quantity</strong>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', margin: '5px 0' }}>
                    +{duplicateItem.newQuantity}
                  </p>
                </div>
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'white', 
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                <strong style={{ color: '#666', fontSize: '12px' }}>New Quantity Will Be:</strong>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#333', margin: '5px 0' }}>
                  {duplicateItem.quantity + duplicateItem.newQuantity}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleDuplicateAction('add')}
                style={{ width: '100%', padding: '14px' }}
              >
                ✅ Add {duplicateItem.newQuantity} More (Total: {duplicateItem.quantity + duplicateItem.newQuantity})
              </button>
              
              {duplicateItem.quantity > 1 && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleDuplicateAction('decrease')}
                  style={{ width: '100%', padding: '14px' }}
                >
                  ➖ Decrease by {duplicateItem.newQuantity} (Total: {Math.max(1, duplicateItem.quantity - duplicateItem.newQuantity)})
                </button>
              )}
              
              <button 
                className="btn btn-danger" 
                onClick={() => handleDuplicateAction('cancel')}
                style={{ width: '100%', padding: '14px' }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingItemIndex !== null && tableItems[editingItemIndex] && !isClosed && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Edit Item Price</h2>
              <button className="close-btn" onClick={() => {
                setShowEditModal(false);
                setEditingItemIndex(null);
                setEditItemPrice('');
              }}>
                ×
              </button>
            </div>

            <div className="form-group">
              <label>Item: {tableItems[editingItemIndex].item_name}</label>
              <p style={{ marginTop: '10px', color: '#666' }}>
                Current Price: ₹{tableItems[editingItemIndex].price.toFixed(2)}
              </p>
            </div>

            <div className="form-group">
              <label>New Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editItemPrice}
                onChange={(e) => setEditItemPrice(e.target.value)}
                placeholder="Enter new price"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItemIndex(null);
                  setEditItemPrice('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  // Prevent editing items in closed tables
                  if (isClosed) {
                    alert('Cannot edit items in a closed table. Please reopen the table to make changes.');
                    setShowEditModal(false);
                    setEditingItemIndex(null);
                    setEditItemPrice('');
                    return;
                  }

                  if (!editItemPrice || parseFloat(editItemPrice) < 0) {
                    alert('Please enter a valid price');
                    return;
                  }

                  if (editingItemIndex === null || editingItemIndex < 0 || editingItemIndex >= tableItems.length) {
                    alert('Invalid item index');
                    return;
                  }

                  const itemToEdit = tableItems[editingItemIndex];
                  
                  try {
                    if (isClosed && billData && billData.id) {
                      // Update closed table bill
                      const updatedItems = [...tableItems];
                      updatedItems[editingItemIndex].price = parseFloat(editItemPrice);
                      
                      const billItems = updatedItems.map((item) => ({
                        item_id: item.item_id || '',
                        item_name: item.item_name || 'Unknown',
                        portion: item.portion || 'full',
                        quantity: parseInt(item.quantity || 1),
                        price: parseFloat(item.price || 0)
                      }));
                      const newTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
                      
                      const response = await fetch(`/api/bills/${billData.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: billItems,
                          total_amount: newTotal
                        }),
                      });
                      
                      const responseData = await response.json().catch(() => ({}));
                      
                      if (response.ok) {
                        await fetchBillForTable();
                        setShowEditModal(false);
                        setEditingItemIndex(null);
                        setEditItemPrice('');
                        alert('Price updated successfully!');
                      } else {
                        console.error('Error response:', responseData);
                        alert(responseData.error || 'Failed to update price. Check console for details.');
                      }
                    } else if (!isClosed && itemToEdit.id) {
                      // Update open table item
                      const response = await fetch(`/api/tables/${id}/items/${itemToEdit.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          price: parseFloat(editItemPrice)
                        }),
                      });
                      
                      const responseData = await response.json().catch(() => ({}));
                      
                      if (response.ok) {
                        await fetchTableItems();
                        setShowEditModal(false);
                        setEditingItemIndex(null);
                        setEditItemPrice('');
                        alert('Price updated successfully!');
                      } else {
                        console.error('Error response:', responseData);
                        alert(responseData.error || 'Failed to update price. Check console for details.');
                      }
                    } else {
                      alert('Unable to update item. Please refresh the page.');
                    }
                  } catch (error) {
                    console.error('Error updating price:', error);
                    alert('Failed to update price: ' + (error.message || 'Unknown error'));
                  }
                }}
                style={{ flex: 1 }}
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableBilling;

