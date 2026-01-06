# How to Run the Database SQL Script

## Method 1: Using psql Command Line (Recommended)

Open your terminal and run:

```bash
cd /Users/rutikchaudhari/Desktop/yashGarden/backend
psql -U postgres -d restaurant_billing -f database.sql
```

**What this does:**
- `-U postgres` - Uses postgres user
- `-d restaurant_billing` - Connects to your database
- `-f database.sql` - Runs the SQL file

**If it asks for password:** Enter your PostgreSQL password (Rutik@104)

---

## Method 2: Using psql Interactive Mode

1. Connect to your database:
```bash
psql -U postgres -d restaurant_billing
```

2. It will ask for password, enter: `Rutik@104`

3. Once connected, run:
```sql
\i database.sql
```

4. Or copy-paste the entire content of `database.sql` file

5. Type `\q` to exit

---

## Method 3: Using pgAdmin (GUI Tool)

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `restaurant_billing` database
4. Select "Query Tool"
5. Click "Open File" button
6. Select `database.sql` file
7. Click "Execute" (F5) or "Run" button

---

## Method 4: Copy-Paste in psql

1. Open terminal and connect:
```bash
psql -U postgres -d restaurant_billing
```

2. Open `database.sql` file in a text editor
3. Copy all the SQL commands
4. Paste into the psql terminal
5. Press Enter

---

## Verify Tables Were Created

After running the script, verify tables exist:

```bash
psql -U postgres -d restaurant_billing
```

Then run:
```sql
\dt
```

You should see:
- items
- tables
- table_items
- bills

Type `\q` to exit.

---

## Troubleshooting

**Error: "database does not exist"**
- Make sure you created the database first
- Check database name matches: `restaurant_billing`

**Error: "permission denied"**
- Make sure you're using the correct user (postgres)
- Check file permissions

**Error: "password authentication failed"**
- Verify your PostgreSQL password
- Check if password in `db.js` matches your actual password

