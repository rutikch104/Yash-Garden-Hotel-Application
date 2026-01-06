# Rebuild Instructions - Fix for Blank Screen

## Issue Fixed

The blank screen issue was caused by the frontend being loaded via `file://` protocol in production, which prevents API calls. The fix:

1. **Backend now serves the frontend** in production mode
2. **Electron loads from `http://localhost:5002`** instead of `file://`
3. **Frontend dist files are unpacked** so they're accessible

## Steps to Rebuild

### 1. Clean Previous Build (Optional but Recommended)

```bash
# Remove old build files
rm -rf dist
rm -rf frontend/dist
```

### 2. Rebuild Frontend

```bash
cd frontend
npm run build
cd ..
```

### 3. Rebuild Windows Application

```bash
npm run build:win
```

### 4. Test the New Build

1. Install the new `.exe` file on your Windows laptop
2. Make sure PostgreSQL is running
3. Make sure database and tables are created
4. Start the application
5. You should now see the application interface!

## What Changed

### backend/server.js
- Added code to serve static frontend files in production
- Backend now serves both API routes and frontend files

### electron-main.js
- Changed to load frontend from `http://localhost:5002` in production
- Added delay to ensure backend starts before loading frontend

### package.json
- Added `frontend/dist/**/*` to `asarUnpack` so files are accessible

## After Rebuilding

The application should now:
- ✅ Show the interface (not blank screen)
- ✅ Connect to the backend server
- ✅ Make API calls successfully
- ✅ Work with your PostgreSQL database

## If Still Not Working

1. **Check backend is starting**:
   - Look for console output when starting the app
   - Backend should log: "Server running on http://localhost:5002"

2. **Check database connection**:
   - Verify PostgreSQL is running
   - Verify database `restaurant_billing` exists
   - Verify tables are created

3. **Check port 5002**:
   - Ensure no other application is using port 5002
   - Windows Firewall should allow the application

4. **Test backend directly**:
   - Open browser on Windows laptop
   - Go to: `http://localhost:5002/api/tables`
   - Should return JSON (if database connected)

## Need Help?

If issues persist after rebuilding:
- Check Windows Event Viewer for errors
- Check console output when starting the app
- Verify all prerequisites are installed
- See `TROUBLESHOOTING.md` for more details

