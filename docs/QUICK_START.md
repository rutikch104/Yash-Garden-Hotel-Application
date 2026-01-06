# Quick Start Guide - Build Windows Application

## 🚀 Fast Track (5 Steps)

### 1. Install All Dependencies

```bash
# Root level
npm install

# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### 2. Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### 3. Build Windows Executable

```bash
npm run build:win
```

### 4. Find Your Application

Check the `dist` folder:
- **Installer**: `dist/Yash Garden Billing System Setup x.x.x.exe`
- **Portable**: `dist/win-unpacked/Yash Garden Billing System.exe`

### 5. Test It!

Run the installer or the portable .exe file.

## 📋 What Gets Built

- ✅ Complete Windows application
- ✅ Backend server bundled
- ✅ Frontend UI bundled
- ✅ Node.js runtime included
- ✅ Professional installer

## ⚠️ Important Notes

1. **Database Required**: Client needs PostgreSQL installed
2. **First Run**: Client must run `initialize-database.js` once
3. **Port**: Application uses port 5002 (make sure it's available)

## 🛠️ Troubleshooting

**Error: "electron not found"**
```bash
npm install
```

**Error: "frontend/dist not found"**
```bash
cd frontend && npm run build && cd ..
```

**Error: "Cannot find module"**
```bash
# Reinstall all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 📦 For Your Client

1. Give them the installer .exe file
2. Include `INSTALLATION_INSTRUCTIONS.txt`
3. They need PostgreSQL installed first
4. They need to run database initialization once

That's it! 🎉

