-- Remove UNIQUE constraint from table_number column
-- This allows creating tables with the same name if the existing one is closed

-- Drop the unique constraint if it exists
ALTER TABLE public.tables DROP CONSTRAINT IF EXISTS tables_table_number_key;

-- Create a composite unique index on (table_number, status) where status = 'open'
-- This ensures we can't have duplicate open tables with the same name
-- But allows multiple closed tables or reusing table numbers after closing
CREATE UNIQUE INDEX IF NOT EXISTS idx_tables_number_open_unique 
ON public.tables(table_number) 
WHERE status = 'open';

-- Add comment
COMMENT ON INDEX idx_tables_number_open_unique IS 'Ensures unique table numbers only for open tables';

