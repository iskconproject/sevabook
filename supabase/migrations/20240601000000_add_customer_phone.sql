-- Add customer_phone column to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customer_phone TEXT;
