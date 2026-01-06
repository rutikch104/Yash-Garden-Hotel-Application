# Installing PostgreSQL on macOS

Since `psql` is not found, you need to install PostgreSQL first. Here are your options:

## Option 1: Install PostgreSQL using Homebrew (Recommended)

### Step 1: Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install PostgreSQL
```bash
brew install postgresql@14
```

### Step 3: Start PostgreSQL
```bash
brew services start postgresql@14
```

### Step 4: Add to PATH (add to ~/.zshrc)
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Step 5: Create database
```bash
createdb restaurant_billing
```

### Step 6: Run SQL script
```bash
cd /Users/rutikchaudhari/Desktop/yashGarden/backend
psql -d restaurant_billing -f database.sql
```

---

## Option 2: Use Postgres.app (GUI - Easier)

1. Download from: https://postgresapp.com/
2. Install and open the app
3. Click "Initialize" to create a new server
4. Click "Open psql" button
5. Run:
```sql
CREATE DATABASE restaurant_billing;
\c restaurant_billing
```
6. Then copy-paste contents of `database.sql`

---

## Option 3: Use Node.js Script (No psql needed!)

**This is the easiest if you already have Node.js installed!**

1. Make sure you have PostgreSQL server running (even if psql command is not available)
2. Install npm packages:
```bash
cd /Users/rutikchaudhari/Desktop/yashGarden/backend
npm install
```

3. Run the setup script:
```bash
npm run setup-db
```

This will automatically:
- Connect to PostgreSQL
- Read database.sql
- Create all tables
- Verify everything worked

**Note:** You still need PostgreSQL server installed and running, but you don't need the `psql` command!

---

## Check if PostgreSQL Server is Running

Even without `psql`, you can check if PostgreSQL server is running:

```bash
# Check if port 5432 is in use
lsof -i :5432
```

If you see output, PostgreSQL is running!

---

## Quick Start (Recommended)

Since you said database is created, PostgreSQL server is likely running. Just use:

```bash
cd /Users/rutikchaudhari/Desktop/yashGarden/backend
npm install
npm run setup-db
```

This will create all tables without needing `psql`!

