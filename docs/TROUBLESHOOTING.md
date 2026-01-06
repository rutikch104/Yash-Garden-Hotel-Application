# Troubleshooting Guide

## Issue: Blank Screen After Installation

If you see a blank screen when running the application, here are the steps to diagnose and fix:

### Quick Fix

The application should now work after rebuilding with the updated code. The issue was that the frontend wasn't being served correctly in production mode.

### Steps to Fix

1. **Rebuild the application** with the updated code:
   ```bash
   # Build frontend
   cd frontend && npm run build && cd ..
   
   # Build Windows app
   npm run build:win
   ```

2. **Check the backend server** is starting:
   - The backend should start automatically
   - Check Windows Task Manager for Node.js processes
   - Port 5002 should be in use

3. **Check console for errors**:
   - Right-click in the app window → Inspect (if available)
   - Or check the console output when starting the app

### Common Issues

#### 1. Backend Server Not Starting

**Symptoms**: Blank screen, no network requests

**Solution**:
- Check if PostgreSQL is running
- Check database connection in `backend/db.js`
- Verify port 5002 is not in use by another application

#### 2. Database Connection Error

**Symptoms**: Error messages in console about database

**Solution**:
- Verify PostgreSQL is installed and running
- Check database name is `restaurant_billing`
- Verify credentials in `backend/db.js` match your PostgreSQL setup
- Ensure database and tables are created

#### 3. Frontend Files Not Found

**Symptoms**: 404 errors for JS/CSS files

**Solution**:
- Ensure `frontend/dist` folder exists in the built app
- Rebuild the application
- Check file paths in the build output

#### 4. Port Already in Use

**Symptoms**: Server fails to start, port 5002 error

**Solution**:
- Close any other applications using port 5002
- Or change the port in `backend/server.js` and `electron-main.js`

### Debug Mode

To see what's happening:

1. **Check if backend is running**:
   - Open Command Prompt
   - Run: `netstat -ano | findstr :5002`
   - Should show the port is in use

2. **Check application logs**:
   - Look for error messages when starting the app
   - Check Windows Event Viewer for application errors

3. **Test backend directly**:
   - Open browser
   - Go to: `http://localhost:5002/api/tables`
   - Should return JSON data (if database is connected)

### Manual Testing

1. **Test Database Connection**:
   ```bash
   cd backend
   node -e "import('./db.js').then(m => console.log('DB OK'))"
   ```

2. **Test Backend Server**:
   - Start backend manually: `node server.js`
   - Open browser: `http://localhost:5002`
   - Should see the application (in production mode)

3. **Check File Structure**:
   ```
   resources/
   ├── app.asar.unpacked/
   │   └── backend/
   │       ├── server.js
   │       ├── db.js
   │       └── ...
   └── frontend/
       └── dist/
           ├── index.html
           ├── assets/
           └── ...
   ```

### Still Not Working?

1. **Check all prerequisites**:
   - ✅ PostgreSQL installed and running
   - ✅ Database `restaurant_billing` created
   - ✅ Tables initialized (run `initialize-database.js`)
   - ✅ Port 5002 available

2. **Rebuild from scratch**:
   ```bash
   # Clean build
   rm -rf frontend/dist
   rm -rf dist
   rm -rf node_modules backend/node_modules frontend/node_modules
   
   # Reinstall
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   
   # Rebuild
   cd frontend && npm run build && cd ..
   npm run build:win
   ```

3. **Contact support** with:
   - Error messages from console
   - Screenshot of blank screen
   - Windows version
   - PostgreSQL version
   - Any error logs

