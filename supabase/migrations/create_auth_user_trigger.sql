-- Migration: Create Auth User Trigger and Backfill Profiles
-- Description: Automatically sync auth.users with public.customers on registration and backfill any missing customer profiles.
-- Target: PostgreSQL / Supabase

-- 1. Create or update the function that handles copying new auth users to customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    full_name = CASE WHEN customers.full_name = '' THEN EXCLUDED.full_name ELSE customers.full_name END,
    phone = CASE WHEN customers.phone IS NULL OR customers.phone = '' THEN EXCLUDED.phone ELSE customers.phone END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop and recreate the trigger to run the function automatically on new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing auth users who do not have a customer record yet
INSERT INTO public.customers (id, email, full_name, phone)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', ''), 
  COALESCE(raw_user_meta_data->>'phone', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
