-- Migration: Addresses — add label column, user RLS policies, and triggers
-- The addresses table already exists. This migration adds what's missing.

-- 1. Add label column if it doesn't exist yet
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS label TEXT DEFAULT 'Home';

-- 2. User-level RLS policies (idempotent: drop before create)
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

-- 3. Index for fast default-address lookups
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(customer_id) WHERE is_default = TRUE;

-- 4. updated_at trigger for addresses
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
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Enforce only one default address per customer
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
    FOR EACH ROW EXECUTE FUNCTION public.enforce_single_default_address();
