-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'none',
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card')),
  payment_details JSONB,
  customer_phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create barcode_settings table
CREATE TABLE IF NOT EXISTS public.barcode_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('CODE128', 'EAN13', 'UPC')),
  size TEXT NOT NULL CHECK (size IN ('50x25', '40x20', '60x30')),
  include_price BOOLEAN NOT NULL DEFAULT true,
  include_title BOOLEAN NOT NULL DEFAULT true,
  include_language BOOLEAN NOT NULL DEFAULT true,
  custom_heading TEXT,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_name TEXT NOT NULL DEFAULT 'ISKCON Temple',
  receipt_header TEXT NOT NULL DEFAULT 'ISKCON Temple Book Stall',
  receipt_footer TEXT NOT NULL DEFAULT 'Thank you for your purchase! Hare Krishna!',
  show_logo BOOLEAN NOT NULL DEFAULT true,
  show_barcode BOOLEAN NOT NULL DEFAULT true,
  custom_message TEXT DEFAULT 'Hare Krishna! Thank you for supporting ISKCON Temple.',
  receipt_size TEXT DEFAULT '80mm',
  printer_type TEXT DEFAULT 'browser',
  printer_ip TEXT DEFAULT '',
  printer_port INTEGER DEFAULT 9100,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory table
CREATE POLICY "Allow authenticated users to read inventory"
  ON public.inventory
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins and managers to insert inventory"
  ON public.inventory
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work', 'arindam@appexert.com')
  );

CREATE POLICY "Allow admins and managers to update inventory"
  ON public.inventory
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work', 'arindam@appexert.com')
  );

CREATE POLICY "Allow admins and managers to delete inventory"
  ON public.inventory
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work', 'arindam@appexert.com')
  );

-- Create RLS policies for transactions table
CREATE POLICY "Allow authenticated users to read transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to update transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work')
  );

CREATE POLICY "Allow admins to delete transactions"
  ON public.transactions
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work')
  );

-- Create RLS policies for transaction_items table
CREATE POLICY "Allow authenticated users to read transaction_items"
  ON public.transaction_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transaction_items"
  ON public.transaction_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for barcode_settings table
CREATE POLICY "Allow authenticated users to read barcode_settings"
  ON public.barcode_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins and managers to insert barcode_settings"
  ON public.barcode_settings
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work', 'arindam@appexert.com')
  );

CREATE POLICY "Allow admins and managers to update barcode_settings"
  ON public.barcode_settings
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work', 'arindam@appexert.com')
  );

-- Create RLS policies for app_settings table
CREATE POLICY "Allow authenticated users to read app_settings"
  ON public.app_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to insert app_settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work')
  );

CREATE POLICY "Allow admins to update app_settings"
  ON public.app_settings
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work')
  );

-- Create function to update inventory stock after transaction
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stock for completed transactions
  IF NEW.status = 'completed' THEN
    -- Update inventory stock for each item in the transaction
    UPDATE public.inventory
    SET
      stock = stock - ti.quantity,
      updated_at = now()
    FROM public.transaction_items ti
    WHERE
      inventory.id = ti.inventory_id AND
      ti.transaction_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update inventory stock after transaction is completed
CREATE TRIGGER on_transaction_completed
  AFTER INSERT OR UPDATE OF status ON public.transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.update_inventory_stock();

-- Create function to update inventory updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update inventory updated_at timestamp
CREATE TRIGGER update_inventory_timestamp
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_timestamp();

-- Create function to update transactions updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update transactions updated_at timestamp
CREATE TRIGGER update_transactions_timestamp
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transactions_timestamp();

-- Create function to update barcode_settings updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_barcode_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update barcode_settings updated_at timestamp
CREATE TRIGGER update_barcode_settings_timestamp
  BEFORE UPDATE ON public.barcode_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_barcode_settings_timestamp();

-- Create function to update app_settings updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update app_settings updated_at timestamp
CREATE TRIGGER update_app_settings_timestamp
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_settings_timestamp();

-- Insert default barcode settings
INSERT INTO public.barcode_settings (
  type,
  size,
  include_price,
  include_title,
  include_language,
  custom_heading
) VALUES (
  'CODE128',
  '50x25',
  true,
  true,
  true,
  'ISKCON Temple'
);

-- Insert default app settings
INSERT INTO public.app_settings (
  temple_name,
  receipt_header,
  receipt_footer,
  show_logo,
  show_barcode,
  custom_message,
  receipt_size,
  printer_type,
  printer_ip,
  printer_port
) VALUES (
  'ISKCON Temple',
  'ISKCON Temple Book Stall',
  'Thank you for your purchase! Hare Krishna!',
  true,
  true,
  'Hare Krishna! Thank you for supporting ISKCON Temple.',
  '80mm',
  'browser',
  '',
  9100
);
