import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database - Dropping all tables...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database\n');
    
    // Drop tables in reverse order of dependencies (to avoid foreign key constraint errors)
    console.log('🗑️  Dropping existing tables...');
    
    const dropTables = [
      'DROP TABLE IF EXISTS public.bills CASCADE;',
      'DROP TABLE IF EXISTS public.table_items CASCADE;',
      'DROP TABLE IF EXISTS public.tables CASCADE;',
      'DROP TABLE IF EXISTS public.items CASCADE;'
    ];
    
    for (const dropQuery of dropTables) {
      try {
        await pool.query(dropQuery);
        const tableName = dropQuery.match(/public\.(\w+)/)?.[1] || 'unknown';
        console.log(`✅ Dropped table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Error dropping table: ${error.message}`);
      }
    }
    
    // Drop indexes if they exist
    console.log('\n🗑️  Dropping existing indexes...');
    const dropIndexes = [
      'DROP INDEX IF EXISTS public.idx_tables_number_open_unique CASCADE;',
      'DROP INDEX IF EXISTS public.idx_tables_status CASCADE;',
      'DROP INDEX IF EXISTS public.idx_table_items_table_id CASCADE;',
      'DROP INDEX IF EXISTS public.idx_bills_table_id CASCADE;',
      'DROP INDEX IF EXISTS public.idx_bills_created_at CASCADE;',
      'DROP INDEX IF EXISTS public.idx_items_item_id CASCADE;'
    ];
    
    for (const dropIndex of dropIndexes) {
      try {
        await pool.query(dropIndex);
        const indexName = dropIndex.match(/public\.(\w+)/)?.[1] || 'unknown';
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        // Ignore errors for indexes that don't exist
      }
    }
    
    console.log('\n📖 Reading database.sql file...');
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
    console.log('🔨 Creating tables and indexes...');
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
      console.log('✅ Database reset complete!');
      console.log('📝 Note: table_number no longer has UNIQUE constraint');
      console.log('📝 Note: Partial unique index ensures only open tables need unique names');
    } else {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
    }

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error resetting database:', error.message);
    await pool.end();
    process.exit(1);
  }
}

resetDatabase();

