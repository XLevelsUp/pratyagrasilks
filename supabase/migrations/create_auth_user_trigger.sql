-- Migration: Create Auth User Trigger and Backfill Profiles
-- Description: Automatically sync auth.users with public.customers on registration,
--              merge any matching walk-in guest customer (by phone, else email)
--              into the new account, and backfill any missing customer profiles.
-- Target: PostgreSQL / Supabase
--
-- NOTE: this version depends on public.normalize_phone_e164() and
--       customers.is_guest, both created by walk_in_guest_customers.sql —
--       run that migration first (it also installs this same function body).

-- 1. Create or update the function that handles copying new auth users to customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_phone TEXT := public.normalize_phone_e164(NEW.raw_user_meta_data->>'phone');
    guest public.customers%ROWTYPE;
BEGIN
    -- Locate a guest to merge (phone match first, else email). Never block signup.
    BEGIN
        SELECT * INTO guest
        FROM public.customers c
        WHERE c.is_guest = true
          AND c.id <> NEW.id
          AND (
                (v_phone IS NOT NULL AND c.phone = v_phone)
             OR (NEW.email IS NOT NULL AND c.email IS NOT NULL AND lower(c.email) = lower(NEW.email))
          )
        ORDER BY c.created_at
        LIMIT 1;

        -- Guest holds the same email → free it before the insert below
        -- (guest has a different id, so ON CONFLICT (id) won't cover UNIQUE(email))
        IF guest.id IS NOT NULL AND guest.email IS NOT NULL
           AND lower(guest.email) = lower(NEW.email) THEN
            UPDATE public.customers SET email = NULL WHERE id = guest.id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: guest lookup failed: %', SQLERRM;
        guest := NULL;
    END;

    INSERT INTO public.customers (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(v_phone, guest.phone, NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = CASE WHEN customers.full_name = '' THEN EXCLUDED.full_name ELSE customers.full_name END,
        phone = CASE WHEN customers.phone IS NULL OR customers.phone = '' THEN EXCLUDED.phone ELSE customers.phone END;

    IF guest.id IS NOT NULL THEN
        BEGIN
            UPDATE public.measurement_profiles SET customer_id = NEW.id WHERE customer_id = guest.id;
            UPDATE public.orders               SET customer_id = NEW.id WHERE customer_id = guest.id;
            UPDATE public.addresses            SET customer_id = NEW.id WHERE customer_id = guest.id;
            UPDATE public.customers
            SET total_spent   = COALESCE(total_spent, 0) + COALESCE(guest.total_spent, 0),
                total_orders  = COALESCE(total_orders, 0) + COALESCE(guest.total_orders, 0),
                last_purchase = GREATEST(last_purchase, guest.last_purchase),
                source        = CASE WHEN guest.total_orders > 0 THEN 'BOTH' ELSE source END,
                full_name     = CASE WHEN full_name = '' THEN guest.full_name ELSE full_name END
            WHERE id = NEW.id;
            DELETE FROM public.customers WHERE id = guest.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user: guest merge failed for %: %', guest.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$;

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
