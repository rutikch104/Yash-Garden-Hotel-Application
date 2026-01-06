import pool from './db.js';

/**
 * Initialize default tables on application startup
 * This ensures tables exist before the application starts serving requests
 */
export async function initializeTables() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing default tables...');

    // Check if tables table exists and create default tables if needed
    const checkTablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tables'
    `);

    const tablesExist = parseInt(checkTablesResult.rows[0].count) > 0;

    if (!tablesExist) {
      console.log('⚠️  Database tables not found. Please run database.sql first to create the schema.');
      return;
    }

    // Check if any tables exist
    const existingTablesResult = await client.query('SELECT COUNT(*) as count FROM tables');
    const tableCount = parseInt(existingTablesResult.rows[0].count);

    if (tableCount === 0) {
      console.log('📋 No tables found. Creating default tables...');
      
      // Create default tables (Table 1 to Table 20)
      const tableNumbers = Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`);
      
      for (const tableNumber of tableNumbers) {
        try {
          await client.query(
            'INSERT INTO tables (table_number, status) VALUES ($1, $2)',
            [tableNumber, 'open']
          );
          console.log(`  ✅ Created ${tableNumber}`);
        } catch (error) {
          // If table already exists (shouldn't happen), skip it
          if (error.code !== '23505') { // Not a unique constraint violation
            console.error(`  ❌ Error creating ${tableNumber}:`, error.message);
          }
        }
      }
      
      console.log('✅ Default tables created successfully!');
    } else {
      console.log(`✅ Found ${tableCount} existing table(s). Skipping table creation.`);
    }
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

