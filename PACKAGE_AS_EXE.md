# Packaging Restaurant Billing System as Windows .exe

This guide explains how to package your Restaurant Billing System as a Windows executable (.exe) file.

## Prerequisites

1. **Node.js** installed on Windows
2. **PostgreSQL** installed on the target machine (or use SQLite as alternative)
3. **Electron** (for full desktop app) or **pkg** (for Node.js app packaging)

## Option 1: Using pkg (Simpler - Node.js App)

### Step 1: Install pkg

```bash
npm install -g pkg
```

Or add it as a dev dependency:
```bash
npm install --save-dev pkg
```

### Step 2: Update package.json

Add the following to your `backend/package.json`:

```json
{
  "name": "yash-garden-billing",
  "version": "1.0.0",
  "pkg": {
    "scripts": [
      "backend/**/*.js"
    ],
    "assets": [
      "backend/database.sql"
    ],
    "targets": [
      "node18-win-x64"
    ]
  },
  "bin": "backend/server.js"
}
```

### Step 3: Build the executable

```bash
cd backend
pkg .
```

This will create `server.exe` in the `backend` directory.

### Step 4: Create a launcher script

Create `start-app.bat`:

```batch
@echo off
echo Starting Restaurant Billing System...
echo.

REM Check if PostgreSQL is running (optional)
REM You may need to start PostgreSQL service

REM Start the server
server.exe

pause
```

## Option 2: Using Electron (Better UX - Full Desktop App)

### Step 1: Install Electron

```bash
npm install --save-dev electron electron-builder
```

### Step 2: Create main Electron process

Create `electron-main.js` in the root directory:

```javascript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets/icon.png') // Optional: add an icon
  });

  // Start backend server
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  serverProcess = spawn('node', [serverPath], {
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  // Wait a bit for server to start, then load frontend
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5000');
  }, 2000);

  mainWindow.on('closed', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update root package.json

```json
{
  "name": "yash-garden-billing",
  "version": "1.0.0",
  "main": "electron-main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win"
  },
  "build": {
    "appId": "com.yashgarden.billing",
    "productName": "Yash Garden Billing System",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "files": [
      "backend/**/*",
      "frontend/build/**/*",
      "electron-main.js",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "backend/database.sql",
        "to": "database.sql"
      }
    ]
  }
}
```

### Step 4: Build the installer

```bash
npm run build-win
```

This creates an installer in the `dist` folder.

## Option 3: Using Nexe (Alternative)

### Step 1: Install nexe

```bash
npm install -g nexe
```

### Step 2: Build executable

```bash
cd backend
nexe server.js -t windows-x64-18.17.0
```

## Important Notes

### Database Setup

1. **PostgreSQL Required**: The client must have PostgreSQL installed
2. **Database Configuration**: Update `backend/db.js` with production database credentials
3. **Initial Setup**: The application will automatically create tables on first run (via `init-tables.js`)

### Alternative: Use SQLite (No Installation Required)

If you want to avoid PostgreSQL installation, you can modify the app to use SQLite:

1. Install SQLite: `npm install better-sqlite3`
2. Update database connection to use SQLite
3. SQLite database file can be bundled with the app

### Distribution Checklist

- [ ] Test the executable on a clean Windows machine
- [ ] Ensure PostgreSQL is installed and running (or use SQLite)
- [ ] Include database setup instructions
- [ ] Create a README for end users
- [ ] Test all features work correctly
- [ ] Include any required configuration files

## Recommended Approach

For your use case, I recommend **Electron** because:
1. Better user experience (embedded browser, no need to open browser manually)
2. Professional desktop application feel
3. Can bundle everything together
4. Easy to create installers

Would you like me to help set up Electron packaging, or do you prefer the simpler pkg approach?

