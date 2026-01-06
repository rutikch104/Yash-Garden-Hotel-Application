/**
 * Complete Database Initialization Script
 * 
 * This script will:
 * 1. Create all database schema tables (items, tables, table_items, bills)
 * 2. Create all required indexes
 * 3. Create default restaurant tables (Table 1 to Table 20)
 * 
 * Run this once before starting the application:
 * node initialize-database.js
 */

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

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Database Initialization...\n');
    
    // Test connection
    await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database\n');

    // Step 1: Read and execute database.sql (schema creation)
    console.log('📖 Step 1: Creating database schema (tables, indexes)...');
    console.log('─'.repeat(60));
    
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
          await client.query(statement + ';');
          const statementType = statement.match(/CREATE\s+(TABLE|INDEX)/i)?.[1] || 'statement';
          const tableName = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i)?.[1] ||
                           statement.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i)?.[1] ||
                           'unknown';
          console.log(`  ✅ ${statementType.toLowerCase()}: ${tableName}`);
        } catch (error) {
          // Ignore "already exists" errors for IF NOT EXISTS
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' ||
              error.code === '42710') {
            const statementType = statement.match(/CREATE\s+(TABLE|INDEX)/i)?.[1] || 'statement';
            const tableName = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i)?.[1] ||
                             statement.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i)?.[1] ||
                             'unknown';
            console.log(`  ⚠️  ${statementType.toLowerCase()}: ${tableName} (already exists, skipped)`);
          } else {
            console.error(`  ❌ Error in statement ${i + 1}:`, error.message);
            console.error(`     SQL: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    // Step 2: Verify schema tables were created
    console.log('\n🔍 Verifying database schema...');
    console.log('─'.repeat(60));
    
    const schemaResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const expectedTables = ['items', 'tables', 'table_items', 'bills'];
    const createdTables = schemaResult.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !createdTables.includes(t));

    if (missingTables.length === 0) {
      console.log('✅ All schema tables created successfully:');
      expectedTables.forEach(table => {
        console.log(`   ✓ ${table}`);
      });
    } else {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      throw new Error('Database schema creation incomplete');
    }

    // Step 3: Create default restaurant tables (Table 1 to Table 20)
    console.log('\n📋 Step 2: Creating default restaurant tables...');
    console.log('─'.repeat(60));
    
    const existingTablesResult = await client.query('SELECT COUNT(*) as count FROM tables');
    const tableCount = parseInt(existingTablesResult.rows[0].count);

    if (tableCount === 0) {
      console.log('Creating 20 default tables (Table 1 to Table 20)...\n');
      
      const tableNumbers = Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`);
      let createdCount = 0;
      let skippedCount = 0;
      
      for (const tableNumber of tableNumbers) {
        try {
          await client.query(
            'INSERT INTO tables (table_number, status) VALUES ($1, $2)',
            [tableNumber, 'open']
          );
          console.log(`  ✅ Created ${tableNumber}`);
          createdCount++;
        } catch (error) {
          // If table already exists, skip it
          if (error.code === '23505') {
            console.log(`  ⚠️  ${tableNumber} (already exists, skipped)`);
            skippedCount++;
          } else {
            console.error(`  ❌ Error creating ${tableNumber}:`, error.message);
          }
        }
      }
      
      console.log(`\n✅ Created ${createdCount} table(s)`);
      if (skippedCount > 0) {
        console.log(`⚠️  Skipped ${skippedCount} table(s) (already exist)`);
      }
    } else {
      console.log(`✅ Found ${tableCount} existing restaurant table(s). Skipping creation.`);
    }

    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 Database Initialization Complete!');
    console.log('═'.repeat(60));
    console.log(`✅ Schema tables: ${expectedTables.length} created`);
    console.log(`✅ Restaurant tables: ${tableCount > 0 ? tableCount : 20} available`);
    console.log('\n📝 You can now start the application with:');
    console.log('   npm start');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });

