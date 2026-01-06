-- Restaurant Billing System Database Schema
-- Run this script to create all required tables

-- Set schema (default is 'public')
SET search_path TO public;

-- Create Items table
CREATE TABLE IF NOT EXISTS public.items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    half_price DECIMAL(10, 2) NOT NULL,
    full_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tables table
CREATE TABLE IF NOT EXISTS public.tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a partial unique index to ensure unique table numbers only for open tables
-- This allows reusing table numbers after closing, but prevents duplicate open tables
CREATE UNIQUE INDEX IF NOT EXISTS idx_tables_number_open_unique 
ON public.tables(table_number) 
WHERE status = 'open';

-- Create Table Items table (items added to a table)
CREATE TABLE IF NOT EXISTS public.table_items (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    portion VARCHAR(10) NOT NULL CHECK (portion IN ('half', 'full')),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bills table
CREATE TABLE IF NOT EXISTS public.bills (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('paid', 'pending')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'online')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);
CREATE INDEX IF NOT EXISTS idx_table_items_table_id ON public.table_items(table_id);
CREATE INDEX IF NOT EXISTS idx_bills_table_id ON public.bills(table_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON public.bills(created_at);
CREATE INDEX IF NOT EXISTS idx_items_item_id ON public.items(item_id);

-- Add comments for documentation
COMMENT ON TABLE public.items IS 'Food items menu with half and full prices';
COMMENT ON TABLE public.tables IS 'Restaurant tables with open/closed status';
COMMENT ON TABLE public.table_items IS 'Items added to each table before billing';
COMMENT ON TABLE public.bills IS 'Generated bills with payment information';
COMMENT ON COLUMN public.bills.customer_name IS 'Customer name for the bill';
COMMENT ON COLUMN public.bills.customer_phone IS 'Customer phone number for the bill';

