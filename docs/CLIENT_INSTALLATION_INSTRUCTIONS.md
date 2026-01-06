# Installation Instructions for Client

## Yash Garden Billing System - Installation Guide

### Prerequisites

1. **Windows 10/11** operating system
2. **PostgreSQL** database server (download from: https://www.postgresql.org/download/windows/)

---

## Step 1: Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Follow the installation wizard
4. Remember your **postgres user password** (you'll need it later)
5. Complete the installation

---

## Step 2: Create Database

1. Open **pgAdmin** (comes with PostgreSQL installation)
2. Connect to your PostgreSQL server (use the password you set during installation)
3. Right-click on **"Databases"** → **Create** → **Database**
4. Enter database name: `restaurant_billing`
5. Click **Save**

---

## Step 3: Install Application

1. Run the installer: **Yash Garden Billing System Setup x.x.x.exe**
2. Follow the installation wizard
3. Choose installation location (default is fine)
4. Wait for installation to complete
5. Click **Finish**

---

## Step 4: Initialize Database

1. Navigate to the installation folder (usually: `C:\Program Files\Yash Garden Billing System`)
2. Open **Command Prompt** in that folder:
   - Press `Windows + R`
   - Type: `cmd`
   - Navigate to installation folder: `cd "C:\Program Files\Yash Garden Billing System\resources\app.asar.unpacked"`
3. Run the initialization script:
   ```
   node initialize-database.js
   ```
4. Wait for "Database Initialization Complete!" message
5. You should see: "✅ All schema tables created successfully"

---

## Step 5: Configure Database (If Needed)

If your PostgreSQL credentials are different from defaults:

1. Navigate to: `resources\app.asar.unpacked\backend`
2. Open `db.js` in a text editor
3. Update these values if needed:
   ```javascript
   host: 'localhost',
   port: 5432,
   database: 'restaurant_billing',
   user: 'postgres',
   password: 'YOUR_POSTGRES_PASSWORD'
   ```
4. Save the file

---

## Step 6: Start Application

1. Find **"Yash Garden Billing System"** in Start Menu
2. Double-click to launch
3. Or use the desktop shortcut (if created during installation)

The application will start and you should see the Dashboard.

---

## Troubleshooting

### Application won't start
- **Check**: Is PostgreSQL service running?
  - Open Services (Windows + R → `services.msc`)
  - Find "postgresql" service
  - Right-click → Start (if stopped)

### Database connection error
- **Check**: Database name is correct (`restaurant_billing`)
- **Check**: PostgreSQL is running
- **Check**: Password in `db.js` matches your PostgreSQL password
- **Check**: Database was created successfully

### "Tables not found" error
- **Solution**: Run `initialize-database.js` again (Step 4)

### Port already in use
- **Solution**: Close any other applications using port 5002
- Or change port in `backend/server.js` and restart application

---

## First Time Setup

After installation and database initialization:

1. **Add Menu Items**: 
   - Go to Admin page
   - Add your menu items with prices

2. **Create Tables** (if needed):
   - Default 20 tables (Table 1 to Table 20) are created automatically
   - You can create more from Dashboard if needed

3. **Start Using**:
   - Select a table from Dashboard
   - Add items
   - Generate bills
   - View reports

---

## Support

If you encounter any issues:
1. Check all prerequisites are installed
2. Verify PostgreSQL is running
3. Verify database exists and is initialized
4. Check error messages for specific issues

---

## System Requirements

- **OS**: Windows 10 or Windows 11
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 500MB for application + PostgreSQL
- **Database**: PostgreSQL 12 or higher

---

Good luck! 🎉

