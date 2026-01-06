# PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

If you haven't installed PostgreSQL yet:

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

1. Open PostgreSQL terminal:
```bash
psql -U postgres
```

2. Create the database:
```sql
CREATE DATABASE restaurant_billing;
```

3. Exit psql:
```sql
\q
```

## Step 3: Run SQL Script

Run the SQL script to create all tables:

```bash
psql -U postgres -d restaurant_billing -f backend/database.sql
```

Or manually copy and paste the SQL from `backend/database.sql` into psql.

## Step 4: Configure Environment Variables

1. Copy the example env file:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_billing
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=5001
```

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

## Step 6: Test Connection

Start the server:
```bash
npm start
```

You should see: `✅ Connected to PostgreSQL database`

If you see connection errors, check:
- PostgreSQL is running
- Database name, user, and password in `.env` are correct
- Database exists and tables are created

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `pg_isready`
- Verify port 5432 is not blocked

### Authentication Failed
- Check username and password in `.env`
- Verify PostgreSQL user exists: `\du` in psql

### Database Does Not Exist
- Create database: `CREATE DATABASE restaurant_billing;`

### Tables Not Found
- Run the SQL script: `psql -U postgres -d restaurant_billing -f backend/database.sql`

