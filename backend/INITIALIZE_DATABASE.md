# Database Initialization Guide

## Quick Start

Run this **ONE command** to set up everything:

```bash
npm run init-db
```

Or directly:

```bash
node initialize-database.js
```

## What This Script Does

The `initialize-database.js` script will automatically:

1. ✅ **Create Database Schema Tables**
   - `items` - Menu items with half and full prices
   - `tables` - Restaurant tables
   - `table_items` - Items added to tables
   - `bills` - Generated bills

2. ✅ **Create All Required Indexes**
   - Performance indexes for faster queries
   - Unique constraints for data integrity

3. ✅ **Create Default Restaurant Tables**
   - Creates 20 default tables (Table 1 to Table 20)
   - All tables start with status 'open'

## Prerequisites

1. **PostgreSQL must be installed and running**
2. **Database must exist** (e.g., `restaurant_billing`)
3. **Database credentials** must be configured in `db.js` or environment variables

## Configuration

Update database credentials in `backend/db.js` or set environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=restaurant_billing
export DB_USER=postgres
export DB_PASSWORD=your_password
```

## Running the Script

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run init-db
```

### Option 2: Direct Node command

```bash
cd backend
node initialize-database.js
```

## Expected Output

```
🚀 Starting Database Initialization...

✅ Connected to PostgreSQL database

📖 Step 1: Creating database schema (tables, indexes...
────────────────────────────────────────────────────────────
📝 Found 10 SQL statements to execute

  ✅ table: items
  ✅ table: tables
  ✅ table: table_items
  ✅ table: bills
  ✅ index: idx_tables_status
  ✅ index: idx_table_items_table_id
  ✅ index: idx_bills_table_id
  ✅ index: idx_bills_created_at
  ✅ index: idx_items_item_id
  ✅ index: idx_tables_number_open_unique

🔍 Verifying database schema...
────────────────────────────────────────────────────────────
✅ All schema tables created successfully:
   ✓ items
   ✓ tables
   ✓ table_items
   ✓ bills

📋 Step 2: Creating default restaurant tables...
────────────────────────────────────────────────────────────
Creating 20 default tables (Table 1 to Table 20)...

  ✅ Created Table 1
  ✅ Created Table 2
  ... (and so on)

✅ Created 20 table(s)

════════════════════════════════════════════════════════════
🎉 Database Initialization Complete!
════════════════════════════════════════════════════════════
✅ Schema tables: 4 created
✅ Restaurant tables: 20 available

📝 You can now start the application with:
   npm start
════════════════════════════════════════════════════════════
```

## Troubleshooting

### Error: "database does not exist"
- Create the database first: `CREATE DATABASE restaurant_billing;`

### Error: "password authentication failed"
- Check your database credentials in `db.js`
- Verify PostgreSQL is running

### Error: "relation already exists"
- This is OK! The script uses `IF NOT EXISTS` and will skip existing tables
- You can safely run it multiple times

### Tables already exist?
- The script is safe to run multiple times
- It will skip existing schema tables
- It will skip creating restaurant tables if they already exist

## Next Steps

After running the initialization script:

1. ✅ Database is ready
2. ✅ Default tables are created
3. ✅ Start the application: `npm start`
4. ✅ Add menu items via Admin page or `insert-menu-items.js`

## Notes

- This script is **idempotent** - safe to run multiple times
- It won't delete existing data
- It only creates missing tables and indexes
- Default restaurant tables are only created if none exist

