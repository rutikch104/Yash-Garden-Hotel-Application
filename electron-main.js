import { app, BrowserWindow, dialog } from 'electron';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let serverProcess;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: isDev ? undefined : join(__dirname, 'assets', 'icon.ico'),
    show: false, // Don't show until ready
    titleBarStyle: 'default'
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Start backend server first, then load frontend
  startBackendServer();
  
  // Wait a moment for server to start, then load frontend
  setTimeout(() => {
    if (isDev) {
      // In development, load from Vite dev server
      mainWindow.loadURL('http://localhost:5173');
    } else {
      // In production, load from backend server (which serves the frontend)
      mainWindow.loadURL('http://localhost:5002');
    }
  }, 1000);

  mainWindow.on('closed', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    mainWindow = null;
  });
}

function startBackendServer() {
  const paths = getAppPaths();
  const backendPath = join(paths.backend, 'server.js');
  
  // Use system Node.js (required for production)
  const nodeExecutable = 'node';

  console.log('Starting backend server...');
  console.log('Backend path:', backendPath);
  console.log('Backend dir:', paths.backend);
  console.log('Is dev:', isDev);
  console.log('Frontend path:', paths.frontend);

  // Verify backend exists
  if (!existsSync(backendPath)) {
    dialog.showErrorBox(
      'Backend Error',
      `Backend server file not found at: ${backendPath}\n\nPlease rebuild the application.`
    );
    return;
  }

  // Set environment variable with frontend path for backend to use
  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: '5002',
    FRONTEND_DIST_PATH: paths.frontend,
    APP_RESOURCES_PATH: process.resourcesPath || __dirname
  };

  serverProcess = spawn(nodeExecutable, [backendPath], {
    cwd: paths.backend,
    env: env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
    dialog.showErrorBox(
      'Server Error',
      `Failed to start backend server: ${error.message}\n\nPlease ensure Node.js is installed.`
    );
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Server process exited with code ${code}`);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

