# Yash Garden Billing System

A professional Point of Sale (POS) solution for restaurants and hotels, built with React and Node.js.

## Features

- 🍽️ **Table Management**: Create and manage restaurant tables
- 📝 **Billing System**: Generate bills with item management
- 💰 **Payment Tracking**: Track paid and pending bills
- 📊 **Reports**: Daily, pending, and date-specific reports
- 🖨️ **Print Support**: Optimized for 80mm thermal printers
- 🔒 **Security**: Locked tables prevent editing after closure
- 📱 **Responsive UI**: Modern and compact interface

## Tech Stack

- **Frontend**: React, React Router, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Desktop App**: Electron

## Project Structure

```
yashGarden/
├── backend/              # Backend API server
│   ├── server.js         # Express server and routes
│   ├── storage.js        # Database operations
│   ├── db.js             # Database connection (create from db.js.example)
│   ├── database.sql      # Database schema
│   └── initialize-database.js  # Database initialization script
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── App.jsx       # Main app component
│   └── vite.config.js    # Vite configuration
├── electron-main.js      # Electron main process
├── package.json          # Root package.json with Electron config
└── README.md             # This file
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yashGarden
```

### 2. Install Dependencies

```bash
# Install root dependencies (Electron)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/

2. **Create Database**
   ```sql
   CREATE DATABASE restaurant_billing;
   ```

3. **Configure Database Connection**
   ```bash
   cd backend
   cp db.js.example db.js
   # Edit db.js with your database credentials
   ```

4. **Initialize Database**
   ```bash
   cd backend
   npm run init-db
   ```

## Development

### Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Electron (optional, for desktop app)
npm start
```

- Backend: http://localhost:5002
- Frontend: http://localhost:5173

## Building Windows Application

### 1. Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### 2. Build Windows Executable

```bash
npm run build:win
```

The installer will be in the `dist/` folder.

## Configuration

### Database Configuration

Edit `backend/db.js` with your PostgreSQL credentials:

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'restaurant_billing',
  user: 'postgres',
  password: 'your_password',
});
```

Or use environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_billing
DB_USER=postgres
DB_PASSWORD=your_password
```

## Documentation

- [Build Instructions](docs/BUILD_INSTRUCTIONS.md) - How to build Windows application
- [Client Installation](docs/CLIENT_INSTALLATION_INSTRUCTIONS.md) - Instructions for end users
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed file structure

## Scripts

### Root Level
- `npm start` - Start Electron app (development)
- `npm run build:win` - Build Windows executable
- `npm run build:frontend` - Build frontend only

### Backend
- `npm start` - Start server
- `npm run dev` - Start with auto-reload
- `npm run init-db` - Initialize database

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production

## Features Overview

### Dashboard
- View all tables (open/closed)
- Create new tables
- Filter by date
- Navigate to table billing

### Table Billing
- Add items to table
- Manage quantities and portions (half/full)
- Generate bills
- Print bills (optimized for thermal printers)
- Lock tables after closure

### Reports
- Today's bills
- Pending bills
- Date-specific reports
- Separate totals for paid/pending
- Mark pending bills as paid
- Print individual bills

### Admin
- Manage menu items
- Add/edit/delete items
- Set half and full prices

## License

ISC

## Author

Yash Garden
