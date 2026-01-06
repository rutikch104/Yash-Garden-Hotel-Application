import pool from './db.js';

// Helper function to format item data (convert DECIMAL strings to numbers)
const formatItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    half_price: parseFloat(item.half_price) || 0,
    full_price: parseFloat(item.full_price) || 0
  };
};

// Items storage
export const itemsStorage = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM items ORDER BY item_id');
    return result.rows.map(formatItem);
  },

  getById: async (id) => {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    return formatItem(result.rows[0]);
  },

  getByItemId: async (itemId) => {
    const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);
    return formatItem(result.rows[0]);
  },

  create: async (item) => {
    const result = await pool.query(
      'INSERT INTO items (item_id, item_name, half_price, full_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [item.item_id, item.item_name, item.half_price, item.full_price]
    );
    return formatItem(result.rows[0]);
  },

  update: async (id, updates) => {
    const result = await pool.query(
      'UPDATE items SET item_id = $1, item_name = $2, half_price = $3, full_price = $4 WHERE id = $5 RETURNING *',
      [updates.item_id, updates.item_name, updates.half_price, updates.full_price, id]
    );
    return formatItem(result.rows[0]);
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
};

// Tables storage
export const tablesStorage = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM tables ORDER BY table_number');
    return result.rows;
  },

  getByDate: async (date) => {
    // Show all open tables (regardless of creation date) + closed tables from the specified date
    // This ensures open tables are always visible
    const result = await pool.query(
      `SELECT * FROM tables 
       WHERE status = 'open' 
          OR (status = 'closed' AND DATE(created_at) = $1::date)
       ORDER BY table_number`,
      [date]
    );
    return result.rows;
  },

  getToday: async () => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    // Show all open tables (regardless of creation date) + closed tables from today
    // This ensures newly created tables always appear
    const result = await pool.query(
      `SELECT * FROM tables 
       WHERE status = 'open' 
          OR (status = 'closed' AND DATE(created_at) = $1::date)
       ORDER BY table_number`,
      [today]
    );
    return result.rows;
  },

  getYesterday: async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return tablesStorage.getByDate(yesterdayStr);
  },

  getById: async (id) => {
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  getByTableNumber: async (tableNumber) => {
    const result = await pool.query('SELECT * FROM tables WHERE table_number = $1', [tableNumber]);
    return result.rows[0] || null;
  },

  create: async (table) => {
    const result = await pool.query(
      'INSERT INTO tables (table_number, status) VALUES ($1, $2) RETURNING *',
      [table.table_number, 'open']
    );
    return result.rows[0];
  },

  update: async (id, updates) => {
    const updatesArray = [];
    const values = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      updatesArray.push(`status = $${paramCount}`);
      values.push(updates.status);
      paramCount++;
    }

    if (updates.table_number !== undefined) {
      updatesArray.push(`table_number = $${paramCount}`);
      values.push(updates.table_number);
      paramCount++;
    }

    if (updatesArray.length === 0) return null;

    values.push(id);
    const query = `UPDATE tables SET ${updatesArray.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
};

// Table Items storage
export const tableItemsStorage = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM table_items ORDER BY created_at DESC');
    return result.rows;
  },

  getByTableId: async (tableId) => {
    const result = await pool.query(
      `SELECT 
        ti.id,
        ti.table_id,
        ti.portion,
        ti.quantity,
        ti.price,
        ti.created_at,
        i.id as item_db_id,
        i.item_id as item_code,
        i.item_name,
        i.half_price,
        i.full_price
       FROM table_items ti
       JOIN items i ON ti.item_id = i.id
       WHERE ti.table_id = $1
       ORDER BY ti.created_at DESC`,
      [tableId]
    );
    // Format prices as numbers
    return result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price) || 0,
      half_price: parseFloat(row.half_price) || 0,
      full_price: parseFloat(row.full_price) || 0
    }));
  },

  create: async (tableItem) => {
    const result = await pool.query(
      'INSERT INTO table_items (table_id, item_id, portion, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tableItem.table_id, tableItem.item_id, tableItem.portion, tableItem.quantity, tableItem.price]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM table_items WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  },

  deleteByTableId: async (tableId) => {
    await pool.query('DELETE FROM table_items WHERE table_id = $1', [tableId]);
    return true;
  },

  update: async (id, updates) => {
    const updatesArray = [];
    const values = [];
    let paramCount = 1;

    if (updates.price !== undefined) {
      updatesArray.push(`price = $${paramCount}`);
      values.push(parseFloat(updates.price));
      paramCount++;
    }

    if (updates.quantity !== undefined) {
      updatesArray.push(`quantity = $${paramCount}`);
      values.push(parseInt(updates.quantity));
      paramCount++;
    }

    if (updates.portion !== undefined) {
      updatesArray.push(`portion = $${paramCount}`);
      values.push(updates.portion);
      paramCount++;
    }

    if (updatesArray.length === 0) return null;

    values.push(id);
    const query = `UPDATE table_items SET ${updatesArray.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return null;
    
    // Get enriched item data
    const updatedItem = result.rows[0];
    const itemResult = await pool.query(
      `SELECT i.id, i.item_id as item_code, i.item_name, i.half_price, i.full_price
       FROM items i WHERE i.id = $1`,
      [updatedItem.item_id]
    );
    
    if (itemResult.rows.length > 0) {
      const item = itemResult.rows[0];
      return {
        ...updatedItem,
        price: parseFloat(updatedItem.price) || 0,
        item_id: item.item_code,
        item_name: item.item_name,
        half_price: parseFloat(item.half_price) || 0,
        full_price: parseFloat(item.full_price) || 0
      };
    }
    
    return {
      ...updatedItem,
      price: parseFloat(updatedItem.price) || 0
    };
  }
};

// Bills storage
export const billsStorage = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM bills ORDER BY created_at DESC');
    return result.rows.map(bill => ({
      ...bill,
      total_amount: parseFloat(bill.total_amount) || 0,
      items: typeof bill.items === 'string' ? JSON.parse(bill.items) : (bill.items || [])
    }));
  },

  getByDate: async (date) => {
    const result = await pool.query(
      "SELECT * FROM bills WHERE DATE(created_at) = $1::date ORDER BY created_at DESC",
      [date]
    );
    return result.rows.map(bill => ({
      ...bill,
      total_amount: parseFloat(bill.total_amount) || 0,
      items: typeof bill.items === 'string' ? JSON.parse(bill.items) : (bill.items || [])
    }));
  },

  getToday: async () => {
    const today = new Date().toISOString().split('T')[0];
    return billsStorage.getByDate(today);
  },

  getYesterday: async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return billsStorage.getByDate(yesterdayStr);
  },

  getPending: async () => {
    const result = await pool.query(
      "SELECT * FROM bills WHERE payment_status = 'pending' ORDER BY created_at DESC",
      []
    );
    return result.rows.map(bill => ({
      ...bill,
      total_amount: parseFloat(bill.total_amount) || 0,
      items: typeof bill.items === 'string' ? JSON.parse(bill.items) : (bill.items || [])
    }));
  },

  getByTableId: async (tableId) => {
    const result = await pool.query(
      'SELECT * FROM bills WHERE table_id = $1 ORDER BY created_at DESC LIMIT 1',
      [tableId]
    );
    if (result.rows.length === 0) return null;
    const bill = result.rows[0];
    // Parse items - handle both JSONB and string formats
    let items = bill.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    if (!Array.isArray(items)) {
      items = [];
    }
    return {
      ...bill,
      total_amount: parseFloat(bill.total_amount) || 0,
      items: items
    };
  },

  getByTableIdAndDate: async (tableId, date) => {
    const result = await pool.query(
      'SELECT * FROM bills WHERE table_id = $1 AND DATE(created_at) = $2::date ORDER BY created_at DESC LIMIT 1',
      [tableId, date]
    );
    if (result.rows.length === 0) return null;
    const bill = result.rows[0];
    // Parse items - handle both JSONB and string formats
    let items = bill.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    if (!Array.isArray(items)) {
      items = [];
    }
    return {
      ...bill,
      total_amount: parseFloat(bill.total_amount) || 0,
      items: items
    };
  },

  create: async (bill) => {
    const itemsJson = JSON.stringify(bill.items || []);
    const result = await pool.query(
      `INSERT INTO bills (table_id, table_number, total_amount, payment_status, payment_method, items, customer_name, customer_phone)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8) RETURNING *`,
      [bill.table_id, bill.table_number, bill.total_amount, bill.payment_status, bill.payment_method, itemsJson, bill.customer_name || null, bill.customer_phone || null]
    );
    const createdBill = result.rows[0];
    // Parse items properly
    let items = createdBill.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    if (!Array.isArray(items)) {
      items = [];
    }
    return {
      ...createdBill,
      total_amount: parseFloat(createdBill.total_amount) || 0,
      items: items
    };
  },

  update: async (billId, updates) => {
    try {
      // First check if bill exists
      const checkResult = await pool.query('SELECT id FROM bills WHERE id = $1', [billId]);
      if (checkResult.rows.length === 0) {
        console.error('Bill not found with id:', billId);
        return null;
      }

      const updatesArray = [];
      const values = [];
      let paramCount = 1;

      if (updates.total_amount !== undefined) {
        updatesArray.push(`total_amount = $${paramCount}`);
        values.push(parseFloat(updates.total_amount));
        paramCount++;
      }

      if (updates.payment_status !== undefined) {
        updatesArray.push(`payment_status = $${paramCount}`);
        values.push(updates.payment_status);
        paramCount++;
      }

      if (updates.payment_method !== undefined) {
        updatesArray.push(`payment_method = $${paramCount}`);
        values.push(updates.payment_method);
        paramCount++;
      }

      if (updates.items !== undefined) {
        const itemsArray = Array.isArray(updates.items) ? updates.items : [];
        const itemsJson = JSON.stringify(itemsArray);
        updatesArray.push(`items = $${paramCount}::jsonb`);
        values.push(itemsJson);
        paramCount++;
      }

      if (updates.customer_name !== undefined) {
        updatesArray.push(`customer_name = $${paramCount}`);
        values.push(updates.customer_name || null);
        paramCount++;
      }

      if (updates.customer_phone !== undefined) {
        updatesArray.push(`customer_phone = $${paramCount}`);
        values.push(updates.customer_phone || null);
        paramCount++;
      }

      if (updatesArray.length === 0) {
        console.error('No updates provided');
        return null;
      }

      values.push(billId);
      const query = `UPDATE bills SET ${updatesArray.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        console.error('Bill update failed for id:', billId);
        return null;
      }
      
      const updatedBill = result.rows[0];
      // Parse items
      let items = updatedBill.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error('Error parsing items:', e);
          items = [];
        }
      }
      if (!Array.isArray(items)) {
        items = [];
      }
      
      return {
        ...updatedBill,
        total_amount: parseFloat(updatedBill.total_amount) || 0,
        items: items
      };
    } catch (error) {
      console.error('Error in billsStorage.update:', error);
      throw error;
    }
  }
};
