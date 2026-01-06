import { useState, useEffect } from 'react';

function Admin() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_id: '',
    item_name: '',
    half_price: '',
    full_price: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemData = {
      item_id: formData.item_id.trim(),
      item_name: formData.item_name.trim(),
      half_price: parseFloat(formData.half_price),
      full_price: parseFloat(formData.full_price),
    };

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });

        if (response.ok) {
          fetchItems();
          resetForm();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update item');
        }
      } else {
        // Create new item
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });

        if (response.ok) {
          fetchItems();
          resetForm();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to create item');
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_id: item.item_id,
      item_name: item.item_name,
      half_price: item.half_price,
      full_price: item.full_price,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      item_name: '',
      half_price: '',
      full_price: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
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
          🍕 Food Items Management
        </h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Add New Item
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item ID *</label>
              <input
                type="text"
                required
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                placeholder="e.g., ITEM001"
              />
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="e.g., Butter Chicken"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Half Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.half_price}
                  onChange={(e) => setFormData({ ...formData, half_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Full Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.full_price}
                  onChange={(e) => setFormData({ ...formData, full_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>📋 All Items</h3>
          <div style={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: '700',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
            <p>No items found. Add your first item above!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>Half Price</th>
                <th>Full Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_id}</td>
                  <td>{item.item_name}</td>
                  <td>₹{item.half_price.toFixed(2)}</td>
                  <td>₹{item.full_price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;

