# Build Instructions for Windows Application

## Quick Build Guide

### Step 1: Install Dependencies

```bash
# Install Electron and build tools (root level)
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

This creates the `frontend/dist` folder with production files.

### Step 3: Build Windows Executable

```bash
npm run build:win
```

This will:
- Build the frontend (if not already built)
- Package everything with Electron
- Create Windows installer in `dist/` folder

### Step 4: Find Your Application

After building, you'll find:
- **Installer**: `dist/Yash Garden Billing System Setup x.x.x.exe`
- **Portable**: `dist/win-unpacked/Yash Garden Billing System.exe`

---

## What Gets Built

- ✅ Complete Windows application
- ✅ Backend server bundled
- ✅ Frontend UI bundled  
- ✅ Node.js runtime included (via Electron)
- ✅ Professional installer (NSIS)

---

## Distribution to Client

### What to Give Your Client

1. **Installer File**: `Yash Garden Billing System Setup x.x.x.exe`
2. **Instructions**: See `CLIENT_INSTALLATION_INSTRUCTIONS.md` (create this)

### Client Requirements

1. **PostgreSQL** - Must be installed
2. **Database** - Must create `restaurant_billing` database
3. **Initialization** - Must run `initialize-database.js` once
4. **Configuration** - Update `db.js` with their credentials (if needed)

---

## Troubleshooting

### Error: "electron not found"
```bash
npm install
```

### Error: "frontend/dist not found"
```bash
cd frontend && npm run build && cd ..
```

### Error: "Cannot find module"
```bash
# Reinstall all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Build fails
- Check Node.js version: `node --version` (should be 18+)
- Check all dependencies installed
- Try deleting `node_modules` and reinstalling

---

## File Structure After Build

```
dist/
├── Yash Garden Billing System Setup x.x.x.exe  (Installer - give this to client)
└── win-unpacked/                                (Portable version)
    ├── Yash Garden Billing System.exe
    ├── resources/
    │   ├── app.asar                            (Your app code)
    │   └── app.asar.unpacked/
    │       └── backend/                         (Backend files)
    └── ...
```

---

## Notes

- The built app includes everything needed
- Client doesn't need Node.js installed (Electron includes it)
- Client DOES need PostgreSQL installed
- Database setup is separate (one-time initialization)

---

## Ready to Build! 🚀

Follow the 3 steps above and you'll have your Windows application ready!

