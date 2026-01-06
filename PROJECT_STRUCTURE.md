# Project Structure

```
yashGarden/
├── .gitignore              # Git ignore rules
├── .gitattributes          # Git attributes for line endings
├── .editorconfig          # Editor configuration
├── README.md              # Main project documentation
├── CONTRIBUTING.md        # Contribution guidelines
├── PROJECT_STRUCTURE.md   # This file
│
├── package.json           # Root package.json (Electron config)
├── electron-main.js       # Electron main process
│
├── backend/               # Backend API server
│   ├── package.json
│   ├── server.js          # Express server and API routes
│   ├── storage.js         # Database operations
│   ├── db.js              # Database connection (not in git)
│   ├── db.js.example      # Database config template
│   ├── database.sql       # Database schema
│   ├── initialize-database.js  # DB initialization script
│   ├── insert-menu-items.js    # Menu items insertion
│   ├── insert-menu-items.sql    # Menu items SQL
│   └── [other scripts]
│
├── frontend/              # React frontend
│   ├── package.json
│   ├── vite.config.js     # Vite configuration
│   ├── index.html         # HTML entry point
│   └── src/
│       ├── main.jsx       # React entry point
│       ├── App.jsx        # Main app component
│       ├── App.css        # App styles
│       ├── index.css      # Global styles
│       └── components/
│           ├── Dashboard.jsx
│           ├── TableBilling.jsx
│           ├── Reports.jsx
│           ├── Sidebar.jsx
│           └── Admin.jsx
│
└── docs/                  # Additional documentation
    ├── README.md
    ├── BUILD_INSTRUCTIONS.md
    ├── CLIENT_INSTALLATION_INSTRUCTIONS.md
    ├── TROUBLESHOOTING.md
    └── [other docs]
```

## Important Files

### Configuration Files
- `.gitignore` - Files to exclude from Git
- `.gitattributes` - Line ending normalization
- `.editorconfig` - Editor settings
- `package.json` - Root package configuration

### Backend Files
- `backend/server.js` - Main server file with all API routes
- `backend/storage.js` - Database interaction layer
- `backend/db.js` - Database connection (create from `db.js.example`)
- `backend/database.sql` - Complete database schema

### Frontend Files
- `frontend/src/App.jsx` - Main React component with routing
- `frontend/src/components/` - All React components
- `frontend/vite.config.js` - Vite build configuration

### Electron Files
- `electron-main.js` - Electron main process (starts backend, loads frontend)

## Files NOT in Git

- `node_modules/` - Dependencies (install with npm)
- `dist/` - Build outputs
- `backend/db.js` - Database credentials (use `db.js.example`)
- `.env` files - Environment variables
- Build artifacts (`.exe`, etc.)

## Getting Started

1. Clone repository
2. Copy `backend/db.js.example` to `backend/db.js` and configure
3. Run `npm install` in root, backend, and frontend
4. Initialize database: `cd backend && npm run init-db`
5. Start development: See main README.md

