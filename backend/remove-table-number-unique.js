import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function removeTableNumberUnique() {
  try {
    console.log('🔄 Removing UNIQUE constraint from table_number...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');
    
    const sqlFile = readFileSync(join(__dirname, 'remove-table-number-unique.sql'), 'utf8');
    
    const statements = sqlFile
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          if (error.message.includes('does not exist') || error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} - ${error.message.includes('does not exist') ? 'Constraint/index does not exist (skipped)' : 'Already exists (skipped)'}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Note: You can now create tables with the same name if the existing one is closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

removeTableNumberUnique();

