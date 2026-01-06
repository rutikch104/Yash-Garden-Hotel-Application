import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { itemsStorage, tablesStorage, tableItemsStorage, billsStorage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  if (req.method === 'PUT') {
    console.log(`[${req.method}] ${req.path}`, req.body);
  }
  next();
});

// Routes

// Items API
app.get('/api/items', async (req, res) => {
  try {
    const items = await itemsStorage.getAll();
    items.sort((a, b) => a.item_id.localeCompare(b.item_id));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await itemsStorage.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { item_id, item_name, half_price, full_price } = req.body;
    
    // Check if item_id already exists
    const existingItem = await itemsStorage.getByItemId(item_id);
    if (existingItem) {
      return res.status(400).json({ error: 'Item ID already exists' });
    }
    
    const newItem = await itemsStorage.create({
      item_id,
      item_name,
      half_price: parseFloat(half_price),
      full_price: parseFloat(full_price)
    });
    
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const { item_id, item_name, half_price, full_price } = req.body;
    
    // Check if item_id already exists (excluding current item)
    const existingItem = await itemsStorage.getByItemId(item_id);
    if (existingItem && existingItem.id !== parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Item ID already exists' });
    }
    
    const updated = await itemsStorage.update(req.params.id, {
      item_id,
      item_name,
      half_price: parseFloat(half_price),
      full_price: parseFloat(full_price)
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully', item: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const deleted = await itemsStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tables API
app.get('/api/tables', async (req, res) => {
  try {
    const { date } = req.query; // date can be 'today', 'yesterday', or a specific date (YYYY-MM-DD)
    let tables;
    
    if (date === 'today') {
      tables = await tablesStorage.getToday();
    } else if (date === 'yesterday') {
      tables = await tablesStorage.getYesterday();
    } else if (date) {
      // Specific date provided
      tables = await tablesStorage.getByDate(date);
    } else {
      // Default: show today's tables
      tables = await tablesStorage.getToday();
    }
    
    // For closed tables, fetch bill information (closing time, customer name, phone, and payment status)
    const tablesWithBillInfo = await Promise.all(
      tables.map(async (table) => {
        if (table.status === 'closed') {
          const bill = await billsStorage.getByTableId(table.id);
          if (bill) {
            return {
              ...table,
              bill_closed_at: bill.created_at,
              customer_name: bill.customer_name || null,
              customer_phone: bill.customer_phone || null,
              payment_status: bill.payment_status || null,
              payment_method: bill.payment_method || null
            };
          }
        }
        return table;
      })
    );
    
    // Sort: open tables first, then closed tables. Within each group, sort by table number
    tablesWithBillInfo.sort((a, b) => {
      // First sort by status: 'open' comes before 'closed'
      if (a.status !== b.status) {
        if (a.status === 'open') return -1;
        if (b.status === 'open') return 1;
      }
      // Then sort by table number
      const numA = parseInt(a.table_number.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.table_number.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    res.json(tablesWithBillInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const { table_number } = req.body;
    
    // Check if table_number already exists and is open
    const existingTable = await tablesStorage.getByTableNumber(table_number);
    if (existingTable && existingTable.status === 'open') {
      return res.status(400).json({ error: 'Table number already exists and is currently open' });
    }
    
    // If table exists but is closed, we can create a new one with the same name
    // This allows reusing table numbers after closing
    
    const newTable = await tablesStorage.create({ table_number });
    res.json(newTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT routes must come before GET routes with similar patterns
app.put('/api/tables/:id/reopen', async (req, res) => {
  try {
    console.log('PUT /api/tables/:id/reopen called with id:', req.params.id);
    const tableId = parseInt(req.params.id);
    
    // Update table status to open
    const updated = await tablesStorage.update(tableId, { status: 'open' });
    
    if (!updated) {
      console.log('Table not found:', tableId);
      return res.status(404).json({ error: 'Table not found' });
    }
    
    // Get the bill for this table to restore items
    const bill = await billsStorage.getByTableId(tableId);
    
    if (bill && bill.items && Array.isArray(bill.items) && bill.items.length > 0) {
      console.log('Restoring items from bill:', bill.items.length, 'items');
      
      // Restore items from bill to table_items
      for (const billItem of bill.items) {
        // Find the item in the items table by item_id (string)
        const item = await itemsStorage.getByItemId(billItem.item_id);
        
        if (item) {
          // Create table_item entry
          await tableItemsStorage.create({
            table_id: tableId,
            item_id: item.id, // Use database id, not item_id string
            portion: billItem.portion || 'full',
            quantity: parseInt(billItem.quantity || 1),
            price: parseFloat(billItem.price || 0)
          });
          console.log(`Restored item: ${billItem.item_name} (${billItem.portion}) x${billItem.quantity}`);
        } else {
          console.warn(`Item not found for item_id: ${billItem.item_id}, skipping...`);
        }
      }
      
      console.log('Items restored successfully');
    } else {
      console.log('No bill or items found for this table, skipping item restoration');
    }
    
    console.log('Table reopened successfully:', updated.id);
    res.json({ message: 'Table reopened successfully', table: updated });
  } catch (error) {
    console.error('Error reopening table:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tables/:id', async (req, res) => {
  try {
    const table = await tablesStorage.getById(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Table Items API
app.get('/api/tables/:id/items', async (req, res) => {
  try {
    const tableItems = await tableItemsStorage.getByTableId(req.params.id);
    
    // Items are already enriched with item details from the query
    const enrichedItems = tableItems.map(tableItem => ({
      id: tableItem.id,
      table_id: tableItem.table_id,
      item_id: tableItem.item_code || tableItem.item_id,
      item_name: tableItem.item_name,
      portion: tableItem.portion,
      quantity: tableItem.quantity,
      price: parseFloat(tableItem.price),
      created_at: tableItem.created_at,
      half_price: tableItem.half_price,
      full_price: tableItem.full_price
    }));
    
    res.json(enrichedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tables/:id/items', async (req, res) => {
  try {
    const { item_id, portion, quantity } = req.body;
    const tableId = parseInt(req.params.id);
    
    // Get item details
    const item = await itemsStorage.getById(item_id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const price = portion === 'half' ? parseFloat(item.half_price) : parseFloat(item.full_price);
    const quantityToAdd = parseInt(quantity);
    
    // Check if the same item with same portion already exists in this table
    const existingItems = await tableItemsStorage.getByTableId(tableId);
    const existingItem = existingItems.find(
      ti => ti.item_db_id === parseInt(item_id) && ti.portion === portion
    );
    
    if (existingItem) {
      // Update existing item: increase quantity and recalculate price
      const newQuantity = existingItem.quantity + quantityToAdd;
      const newPrice = price * newQuantity;
      
      const updatedItem = await tableItemsStorage.update(existingItem.id, {
        quantity: newQuantity,
        price: newPrice
      });
      
      res.json(updatedItem);
    } else {
      // Create new item
      const totalPrice = price * quantityToAdd;
      const newTableItem = await tableItemsStorage.create({
        table_id: tableId,
        item_id: parseInt(item_id),
        portion,
        quantity: quantityToAdd,
        price: totalPrice
      });
      
      res.json(newTableItem);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tables/:id/items/:itemId', async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { price, quantity, portion } = req.body;
    
    const updates = {};
    if (price !== undefined) updates.price = parseFloat(price);
    if (quantity !== undefined) updates.quantity = parseInt(quantity);
    if (portion !== undefined) updates.portion = portion;
    
    const updated = await tableItemsStorage.update(itemId, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully', item: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tables/:id/items/:itemId', async (req, res) => {
  try {
    const deleted = await tableItemsStorage.delete(req.params.itemId);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bills API
app.post('/api/bills', async (req, res) => {
  try {
    const { table_id, table_number, total_amount, payment_status, payment_method, items, customer_name, customer_phone } = req.body;
    const parsedTableId = parseInt(table_id);
    
    // Check if a bill already exists for this table today
    const today = new Date().toISOString().split('T')[0];
    const existingBill = await billsStorage.getByTableIdAndDate(parsedTableId, today);
    
    let bill;
    if (existingBill) {
      // Update existing bill instead of creating a new one
      bill = await billsStorage.update(existingBill.id, {
        total_amount: parseFloat(total_amount),
        payment_status,
        payment_method,
        items: Array.isArray(items) ? items : [],
        customer_name: customer_name || null,
        customer_phone: customer_phone || null
      });
    } else {
      // Create new bill
      bill = await billsStorage.create({
        table_id: parsedTableId,
        table_number,
        total_amount: parseFloat(total_amount),
        payment_status,
        payment_method,
        items: Array.isArray(items) ? items : [],
        customer_name: customer_name || null,
        customer_phone: customer_phone || null
      });
    }
    
    // Close table
    await tablesStorage.update(parsedTableId, { status: 'closed' });
    
    // Clear table items
    await tableItemsStorage.deleteByTableId(parsedTableId);
    
    res.json({ id: bill.id, message: existingBill ? 'Bill updated successfully' : 'Bill created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills', async (req, res) => {
  try {
    const { date } = req.query;
    let bills;
    
    if (date) {
      bills = await billsStorage.getByDate(date);
    } else {
      bills = await billsStorage.getAll();
    }
    
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/today', async (req, res) => {
  try {
    const bills = await billsStorage.getToday();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/yesterday', async (req, res) => {
  try {
    const bills = await billsStorage.getYesterday();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/pending', async (req, res) => {
  try {
    const bills = await billsStorage.getPending();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT routes must be defined before GET routes with similar patterns to avoid conflicts
app.put('/api/bills/:id', async (req, res) => {
  try {
    console.log('PUT /api/bills/:id called with id:', req.params.id);
    console.log('Request body:', req.body);
    const billId = parseInt(req.params.id);
    const { items, total_amount, payment_status, payment_method, customer_name, customer_phone } = req.body;
    
    const updates = {};
    if (items !== undefined) updates.items = items;
    if (total_amount !== undefined) updates.total_amount = parseFloat(total_amount);
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (customer_name !== undefined) updates.customer_name = customer_name;
    if (customer_phone !== undefined) updates.customer_phone = customer_phone;
    
    console.log('Updates to apply:', updates);
    const updated = await billsStorage.update(billId, updates);
    
    if (!updated) {
      console.log('Bill not found:', billId);
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    console.log('Bill updated successfully:', updated.id);
    res.json({ message: 'Bill updated successfully', bill: updated });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/table/:tableId', async (req, res) => {
  try {
    const tableId = parseInt(req.params.tableId);
    const bill = await billsStorage.getByTableId(tableId);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found for this table' });
    }
    
    // Items are already parsed in getByTableId
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from frontend/dist in production (for Electron)
if (isProduction) {
  // Get frontend path from environment variable (set by Electron)
  const frontendDistPath = process.env.FRONTEND_DIST_PATH || 
    join(process.env.APP_RESOURCES_PATH || __dirname, '..', 'frontend', 'dist');
  
  console.log('Production mode - Looking for frontend at:', frontendDistPath);
  console.log('Frontend exists:', existsSync(frontendDistPath));
  
  if (existsSync(frontendDistPath)) {
    console.log('✅ Serving frontend from:', frontendDistPath);
    
    // Serve static files (JS, CSS, images, etc.)
    app.use(express.static(frontendDistPath, {
      maxAge: 0, // Don't cache in development
      etag: false
    }));
    
    // Serve index.html for all non-API routes (for React Router)
    // This must be AFTER all API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        // Don't serve index.html for API routes
        return next();
      }
      
      const indexPath = join(frontendDistPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('❌ Error serving index.html:', err);
          res.status(500).send('Error loading application');
        }
      });
    });
  } else {
    console.error('❌ Frontend dist folder not found at:', frontendDistPath);
    console.error('Current directory:', __dirname);
    console.error('Resources path:', process.env.APP_RESOURCES_PATH);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log('Production mode: Serving frontend from backend server');
  }
});
