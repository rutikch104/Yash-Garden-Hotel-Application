import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'restaurant_billing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Rutik@104',
});

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully!\n');

    // Read SQL file
    console.log('📖 Reading database.sql file...');
    const sqlFile = readFileSync(join(__dirname, 'database.sql'), 'utf8');
    
    // Remove single-line comments and split by semicolons
    const cleanedSql = sqlFile
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolons and filter
    const statements = cleanedSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               trimmed.toLowerCase() !== 'if not exists';
      });

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement + ';');
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Ignore "already exists" errors for IF NOT EXISTS
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07') {
            console.log(`⚠️  Statement ${i + 1} - Already exists (skipped)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.error(`   SQL: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Created Tables:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    const expectedTables = ['items', 'tables', 'table_items', 'bills'];
    const createdTables = result.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !createdTables.includes(t));

    if (missingTables.length === 0) {
      console.log('\n🎉 All tables created successfully!');
    } else {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
    }

    await pool.end();
    console.log('\n✅ Database setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check database name: restaurant_billing');
    console.error('3. Verify username and password in db.js');
    console.error('4. Ensure database exists');
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();

