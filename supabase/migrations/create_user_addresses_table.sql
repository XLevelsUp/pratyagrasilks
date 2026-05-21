-- Migration: Create or Update Addresses Table
-- Description: Create the addresses table with label and is_default, migrate any JSON address data, and set up Row Level Security (RLS).
-- Target: PostgreSQL / Supabase

-- 1. Create or Update the addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home' CHECK (label IN ('Home', 'Work', 'Other') OR label IS NOT NULL),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the 'label' column exists (if the table was created previously without it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'addresses' 
          AND column_name = 'label'
    ) THEN
        ALTER TABLE public.addresses ADD COLUMN label TEXT DEFAULT 'Home';
    END IF;
END $$;

-- 2. Migrate JSON addresses data if it exists in customers table
DO $$
DECLARE
    col_exists BOOLEAN;
    r RECORD;
    addr JSONB;
BEGIN
    -- Check if 'addresses' column exists in 'customers' table as JSON/JSONB
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'customers' 
          AND column_name = 'addresses'
    ) INTO col_exists;

    IF col_exists THEN
        -- Loop through customers and extract addresses from JSON array
        FOR r IN SELECT id, addresses FROM public.customers WHERE addresses IS NOT NULL LOOP
            IF jsonb_typeof(r.addresses) = 'array' THEN
                FOR addr IN SELECT jsonb_array_elements(r.addresses) LOOP
                    INSERT INTO public.addresses (
                        customer_id,
                        label,
                        full_name,
                        phone,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        is_default
                    ) VALUES (
                        r.id,
                        COALESCE(addr->>'label', 'Home'),
                        COALESCE(addr->>'full_name', ''),
                        COALESCE(addr->>'phone', ''),
                        COALESCE(addr->>'address_line1', ''),
                        addr->>'address_line2',
                        COALESCE(addr->>'city', ''),
                        COALESCE(addr->>'state', ''),
                        COALESCE(addr->>'postal_code', addr->>'pincode', ''),
                        COALESCE(addr->>'country', 'India'),
                        COALESCE((addr->>'is_default')::boolean, FALSE)
                    );
                END LOOP;
            END IF;
        END LOOP;

        -- Remove the old JSON/JSONB column from customers table
        ALTER TABLE public.customers DROP COLUMN addresses;
    END IF;
END $$;

-- 3. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON public.addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(customer_id) WHERE is_default = TRUE;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 5. Setup / Recreate RLS Policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses
    FOR DELETE USING (auth.uid() = customer_id);

-- 6. Trigger to automatically handle updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Trigger/Function to enforce that only one address per customer is marked as default
CREATE OR REPLACE FUNCTION public.enforce_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.addresses
        SET is_default = FALSE
        WHERE customer_id = NEW.customer_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_default_address_trigger ON public.addresses;
CREATE TRIGGER enforce_single_default_address_trigger
    BEFORE INSERT OR UPDATE OF is_default ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_single_default_address();
