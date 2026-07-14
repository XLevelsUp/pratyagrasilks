-- ============================================================================
-- WALK-IN GUEST CUSTOMERS — Pratyagra Designers shop-floor flow
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- What this does (in dependency order):
--   1. normalize_phone_e164()  — canonical E.164 normalizer (default IN/+91).
--   2. customers.is_guest      — flag for staff-created walk-ins, backfilled
--                                from source='POS' rows with no auth user.
--   3. E.164 backfill          — existing 10-digit phones → '+91XXXXXXXXXX'.
--   4. Guest dedupe            — merge guest rows sharing a phone (keep oldest).
--   5. uq_customers_guest_phone — partial UNIQUE index: one guest per phone.
--                                Scoped to guests so legacy ONLINE duplicates
--                                can never break signups or this migration.
--   6. INSERT RLS policy       — staff (ADMIN/CASHIER) may insert guest rows
--                                via the RLS client (no service role needed).
--   7. handle_new_user()       — signup trigger now MERGES a matching guest
--                                (by phone, else email) into the new account:
--                                measurement_profiles / orders / addresses are
--                                re-pointed, stats carried over, guest deleted.
--
-- Design notes:
--   * The POS sentinel bucket (email 'pos-walkin@pratyagrasilks.internal',
--     phone '0000000000') is deliberately excluded everywhere: it stays
--     non-guest and its phone is unnormalizable by design.
--   * The merge is wrapped in exception handlers — a merge failure logs a
--     WARNING but can never abort a user registration (the trigger fires
--     AFTER INSERT ON auth.users).
-- ============================================================================

-- ── 1. Phone normalizer (shared by backfill + signup trigger) ──────────────
CREATE OR REPLACE FUNCTION public.normalize_phone_e164(raw TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    digits TEXT;
BEGIN
    IF raw IS NULL OR btrim(raw) = '' THEN
        RETURN NULL;
    END IF;
    -- Already E.164
    IF raw ~ '^\+[1-9][0-9]{7,14}$' THEN
        RETURN raw;
    END IF;
    digits := regexp_replace(raw, '\D', '', 'g');
    -- Bare 10-digit Indian mobile
    IF digits ~ '^[6-9][0-9]{9}$' THEN
        RETURN '+91' || digits;
    END IF;
    -- 91-prefixed Indian mobile
    IF digits ~ '^91[6-9][0-9]{9}$' THEN
        RETURN '+' || digits;
    END IF;
    -- Unnormalizable (including the '0000000000' sentinel)
    RETURN NULL;
END;
$$;

-- ── 2. is_guest flag + backfill ─────────────────────────────────────────────
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false;

UPDATE public.customers c
SET is_guest = true
WHERE c.is_guest = false
  AND c.source = 'POS'
  AND c.email IS DISTINCT FROM 'pos-walkin@pratyagrasilks.internal'
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = c.id);

-- ── 3. E.164 backfill (skips already-E.164 + unnormalizable rows) ──────────
UPDATE public.customers
SET phone = public.normalize_phone_e164(phone)
WHERE phone IS NOT NULL
  AND phone !~ '^\+'
  AND public.normalize_phone_e164(phone) IS NOT NULL;

-- ── 4. Dedupe guest rows sharing a phone (keep oldest, merge children) ─────
DO $$
DECLARE
    dup RECORD;
    keeper UUID;
    losers UUID[];
BEGIN
    FOR dup IN
        SELECT phone,
               array_agg(id ORDER BY created_at) AS ids,
               SUM(total_spent)   AS sum_spent,
               SUM(total_orders)  AS sum_orders,
               MAX(last_purchase) AS max_purchase
        FROM public.customers
        WHERE is_guest = true AND phone IS NOT NULL
        GROUP BY phone
        HAVING COUNT(*) > 1
    LOOP
        keeper := dup.ids[1];
        losers := dup.ids[2:];
        UPDATE public.measurement_profiles SET customer_id = keeper WHERE customer_id = ANY(losers);
        UPDATE public.orders               SET customer_id = keeper WHERE customer_id = ANY(losers);
        UPDATE public.addresses            SET customer_id = keeper WHERE customer_id = ANY(losers);
        UPDATE public.customers
        SET total_spent   = COALESCE(dup.sum_spent, 0),
            total_orders  = COALESCE(dup.sum_orders, 0),
            last_purchase = dup.max_purchase
        WHERE id = keeper;
        DELETE FROM public.customers WHERE id = ANY(losers);
    END LOOP;
END;
$$;

-- ── 5. One guest per phone ──────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_guest_phone
    ON public.customers(phone)
    WHERE is_guest = true AND phone IS NOT NULL;

-- ── 6. Staff can INSERT guest rows through RLS ──────────────────────────────
DROP POLICY IF EXISTS "Staff can insert guest customers" ON public.customers;
CREATE POLICY "Staff can insert guest customers" ON public.customers
    FOR INSERT WITH CHECK (
        is_guest = true
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'CASHIER')
        )
    );

-- ── 7. Signup trigger: create customer + merge matching guest ──────────────
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
