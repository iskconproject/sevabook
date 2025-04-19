-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add location_id to inventory table
ALTER TABLE public.inventory ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Add location_id to transactions table
ALTER TABLE public.transactions ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Add location_id to app_settings table
ALTER TABLE public.app_settings ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Enable Row Level Security on locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for locations table
CREATE POLICY "Allow authenticated users to read locations"
  ON public.locations
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to insert locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('superAdmin', 'admin')
    )
  );

CREATE POLICY "Allow admins to update locations"
  ON public.locations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('superAdmin', 'admin')
    )
  );

-- Insert default location (Temple Store)
INSERT INTO public.locations (
  name,
  description,
  address,
  is_active,
  is_default
) VALUES (
  'Temple Store',
  'Main temple book stall',
  'ISKCON Temple',
  true,
  true
);

-- Insert Rath Yatra location
INSERT INTO public.locations (
  name,
  description,
  address,
  is_active,
  is_default
) VALUES (
  'Rath Yatra Festival',
  'Annual Rath Yatra festival book stall',
  'Rath Yatra Festival Ground',
  true,
  false
);

-- Update existing inventory to use default location
UPDATE public.inventory
SET location_id = (SELECT id FROM public.locations WHERE is_default = true)
WHERE location_id IS NULL;

-- Update existing transactions to use default location
UPDATE public.transactions
SET location_id = (SELECT id FROM public.locations WHERE is_default = true)
WHERE location_id IS NULL;

-- Update existing app_settings to use default location
UPDATE public.app_settings
SET location_id = (SELECT id FROM public.locations WHERE is_default = true)
WHERE location_id IS NULL;

-- Create function to update locations updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_locations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update locations updated_at timestamp
CREATE TRIGGER update_locations_timestamp
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_locations_timestamp();
