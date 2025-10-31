-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  abn TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  bank_bsb TEXT,
  bank_account TEXT,
  bank_account_name TEXT,
  notes TEXT,
  invoice_notes TEXT,
  estimate_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  abn TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT DEFAULT 'custom',
  line_items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  gst DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  line_items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  gst DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_estimates_date ON estimates(date DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Disable Row Level Security for personal use (enable when adding Firebase auth)
ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;

-- Allow public access for now (replace with proper RLS policies when using Firebase auth)
-- For production with Firebase, use policies like:
-- CREATE POLICY "Allow all operations for authenticated users" ON invoices
--   FOR ALL USING (auth.uid() IS NOT NULL);

-- Backfill support: add columns if they don't already exist
DO $$ BEGIN
  BEGIN
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_bsb TEXT;
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_account TEXT;
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS invoice_notes TEXT;
    ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS estimate_notes TEXT;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'custom';
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;


