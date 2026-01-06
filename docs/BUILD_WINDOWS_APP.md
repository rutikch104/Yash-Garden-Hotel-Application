# Building Windows Application (.exe)

This guide will help you create a Windows executable (.exe) file for the Yash Garden Billing System.

## Prerequisites

1. **Node.js** installed (v18 or higher)
2. **PostgreSQL** installed on the target machine (or use SQLite alternative)
3. **Windows** machine for building (or use GitHub Actions for cross-platform)

## Step-by-Step Instructions

### Step 1: Install Dependencies

```bash
# Install root dependencies (Electron)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

This creates the `frontend/dist` folder with production-ready files.

### Step 3: Create Application Icon (Optional)

1. Create an `assets` folder in the root directory
2. Add `icon.ico` file (256x256 or 512x512 pixels)
3. You can use online tools to convert PNG to ICO: https://convertio.co/png-ico/

If you don't have an icon, the build will still work but use the default Electron icon.

### Step 4: Build Windows Executable

```bash
npm run build:win
```

This will:
- Build the frontend
- Package everything with Electron
- Create an installer in the `dist` folder

### Step 5: Find Your Application

After building, you'll find:
- **Installer**: `dist/Yash Garden Billing System Setup x.x.x.exe`
- **Portable**: `dist/win-unpacked/Yash Garden Billing System.exe`

## Distribution Checklist

Before giving to your client:

- [ ] Test the .exe on a clean Windows machine
- [ ] Ensure PostgreSQL is installed on client's machine
- [ ] Create database: `restaurant_billing`
- [ ] Run `initialize-database.js` once to set up tables
- [ ] Test all features work correctly
- [ ] Include installation instructions

## Installation Instructions for Client

Create a `INSTALLATION_INSTRUCTIONS.txt` file:

```
YASH GARDEN BILLING SYSTEM - Installation Instructions
======================================================

1. INSTALL POSTGRESQL
   - Download from: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember your postgres user password

2. CREATE DATABASE
   - Open pgAdmin (comes with PostgreSQL)
   - Right-click "Databases" → Create → Database
   - Name: restaurant_billing
   - Click Save

3. INSTALL APPLICATION
   - Run: Yash Garden Billing System Setup x.x.x.exe
   - Follow installation wizard
   - Choose installation location

4. INITIALIZE DATABASE
   - Navigate to installation folder
   - Open Command Prompt in that folder
   - Run: node initialize-database.js
   - Wait for "Database Initialization Complete!"

5. START APPLICATION
   - Double-click "Yash Garden Billing System" from Start Menu
   - Or use desktop shortcut

6. CONFIGURE DATABASE (if needed)
   - Edit: backend/db.js
   - Update database credentials if different from default

TROUBLESHOOTING:
- If app won't start: Check PostgreSQL is running
- If database errors: Verify database name and credentials
- Check Windows Firewall allows the application
```

## Alternative: Using SQLite (No PostgreSQL Required)

If you want to avoid PostgreSQL installation, you can modify the app to use SQLite:

1. Install SQLite package:
```bash
cd backend
npm install better-sqlite3
```

2. Update `backend/db.js` to use SQLite instead of PostgreSQL
3. Update `database.sql` to SQLite syntax
4. Rebuild the application

## Development Mode

To test the Electron app during development:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Electron
npm start
```

## Build Options

- **Installer**: `npm run build:win` - Creates installer (.exe)
- **Portable**: `npm run pack` - Creates portable folder (no installer)
- **Development**: `npm start` - Run in development mode

## File Structure After Build

```
dist/
├── Yash Garden Billing System Setup x.x.x.exe  (Installer)
└── win-unpacked/                                (Portable version)
    ├── Yash Garden Billing System.exe
    ├── resources/
    │   ├── app.asar                            (Your app code)
    │   └── backend/                             (Backend files)
    └── ...
```

## Notes

- The built application includes Node.js runtime
- Backend server runs automatically when app starts
- Frontend is bundled and served locally
- Database must be set up separately (PostgreSQL or SQLite)

## Support

If you encounter issues:
1. Check Node.js version: `node --version` (should be 18+)
2. Check all dependencies installed: `npm install` in all folders
3. Check PostgreSQL is running
4. Check database credentials in `backend/db.js`

