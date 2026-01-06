# Insert Menu Items Script

This guide explains how to insert all menu items from the Yash Garden menu into the database.

## Two Methods Available

### Method 1: Using SQL Script (Recommended for direct database access)

**File:** `insert-menu-items.sql`

**Steps:**
1. Make sure your database is set up and running
2. Run the SQL script using psql:
   ```bash
   psql -U postgres -d restaurant_billing -f backend/insert-menu-items.sql
   ```
   
   Or if you're already in psql:
   ```sql
   \i backend/insert-menu-items.sql
   ```

**Advantages:**
- Direct SQL execution
- Can be run from any PostgreSQL client
- Easy to review and modify

### Method 2: Using Node.js Script (Recommended for automated setup)

**File:** `insert-menu-items.js`

**Steps:**
1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Run the Node.js script:
   ```bash
   node insert-menu-items.js
   ```

**Advantages:**
- Shows detailed statistics (inserted/updated/errors)
- Uses existing database connection from `db.js`
- Better error handling and reporting

## What Gets Inserted

The script inserts **all menu items** from the Yash Garden menu, including:

- 🥤 Cold Drinks (4 items)
- 🥗 Papad (9 items)
- 🍜 Chinese (12 items)
- 🍽 Soups (8 items)
- 🐟 Sea Food (6 items)
- 🥤 Roti/Chapati (4 items)
- 🍚 Rice (9 items)
- ⭐ Veg Starter (10 items)
- ⭐ Veg Main Course (34 items)
  - Paneer Sabji Types (14 items)
  - Kaju Sabji Types (4 items)
  - Vegetable Sabji (7 items)
  - Dal/Khichdi (9 items)
- 🍗 Non-Veg Starter (34 items)
- 🍛 Chicken Main Course (5 items)
- 🍖 Mutton Main Course (4 items)
- 🐐 Weight-Based Cooking Charges (8 items)
  - Mutton (2 items)
  - Country Chicken (2 items)
  - Broiler Chicken (2 items)
  - Fish (2 items)

**Total: ~163 menu items**

## Important Notes

1. **Items with Price 0.00**: Some items in the menu had "₹-" (no price listed). These are inserted with `0.00` as the price. You'll need to update these manually with actual prices.

2. **Duplicate Handling**: Both scripts use `ON CONFLICT` clauses, so if you run them multiple times, existing items will be updated rather than creating duplicates.

3. **Item IDs**: Each item has a unique `item_id` code:
   - `CD001`, `CD002`, etc. for Cold Drinks
   - `PAP001`, `PAP002`, etc. for Papad
   - `CHN001`, `CHN002`, etc. for Chinese
   - And so on...

4. **Half vs Full Price**: 
   - Items with only one price have the same value for both `half_price` and `full_price`
   - Items with two prices (half/full) have different values
   - Items with "₹-" have `0.00` for both

## Updating Prices Manually

If you need to update prices for items that were set to 0.00, you can use:

```sql
UPDATE items 
SET half_price = <new_price>, full_price = <new_price> 
WHERE item_id = '<item_id>';
```

Or update via the application's Items Management interface.

## Verification

After running the script, verify the items were inserted:

```sql
SELECT COUNT(*) FROM items;
```

You should see approximately 163 items.

To see items with missing prices:

```sql
SELECT item_id, item_name, half_price, full_price 
FROM items 
WHERE half_price = 0.00 OR full_price = 0.00;
```

## Troubleshooting

### Error: "relation items does not exist"
- Make sure you've run `database.sql` first to create the tables
- Run: `psql -U postgres -d restaurant_billing -f backend/database.sql`

### Error: "duplicate key value violates unique constraint"
- This means the item already exists. The script will update it instead of inserting a new one.

### Error: "connection refused" or "authentication failed"
- Check your database credentials in `.env` file
- Make sure PostgreSQL is running
- Verify database name, user, and password are correct

