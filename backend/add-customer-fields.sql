-- Add customer_name and customer_phone columns to bills table
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Add comments
COMMENT ON COLUMN public.bills.customer_name IS 'Customer name for the bill';
COMMENT ON COLUMN public.bills.customer_phone IS 'Customer phone number for the bill';

