-- ============================================================================
-- MEASUREMENT PROFILES — multi-profile tailoring measurements per customer
-- (Pratyagra Designer bespoke branch — mirrors the printed measurement sheet)
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Design notes:
--   * 1-to-many: customers → measurement_profiles (e.g. "Self", "Daughter").
--   * All 27 measurements are NULLABLE DECIMAL(5,2) — partial entry is a
--     first-class state for rapid shop-floor sessions. CHECK bounds 1–100
--     inches mirror the app-side Zod validation.
--   * RLS is STAFF-ROLE based (profiles.role IN ADMIN/CASHIER), never
--     auth.uid() = customer_id — POS walk-in customers have standalone UUIDs
--     with no auth user, so ownership policies would not work.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.measurement_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

    profile_label TEXT NOT NULL,          -- "Self", "Daughter", ...
    outfit_type   TEXT,                   -- sheet header field
    designer      TEXT,                   -- sheet header field

    -- ── Upper Body ─────────────────────────────────────────────
    arm_hole        DECIMAL(5,2) CHECK (arm_hole        IS NULL OR (arm_hole        >= 1 AND arm_hole        <= 100)),
    bicep           DECIMAL(5,2) CHECK (bicep           IS NULL OR (bicep           >= 1 AND bicep           <= 100)),
    neck_deep_front DECIMAL(5,2) CHECK (neck_deep_front IS NULL OR (neck_deep_front >= 1 AND neck_deep_front <= 100)),
    neck_deep_back  DECIMAL(5,2) CHECK (neck_deep_back  IS NULL OR (neck_deep_back  >= 1 AND neck_deep_back  <= 100)),
    sleeve_length   DECIMAL(5,2) CHECK (sleeve_length   IS NULL OR (sleeve_length   >= 1 AND sleeve_length   <= 100)),
    wrist           DECIMAL(5,2) CHECK (wrist           IS NULL OR (wrist           >= 1 AND wrist           <= 100)),
    shoulder_front  DECIMAL(5,2) CHECK (shoulder_front  IS NULL OR (shoulder_front  >= 1 AND shoulder_front  <= 100)),
    shoulder_back   DECIMAL(5,2) CHECK (shoulder_back   IS NULL OR (shoulder_back   >= 1 AND shoulder_back   <= 100)),

    -- ── Torso ──────────────────────────────────────────────────
    shoulder_to_apex       DECIMAL(5,2) CHECK (shoulder_to_apex       IS NULL OR (shoulder_to_apex       >= 1 AND shoulder_to_apex       <= 100)),
    shoulder_to_bust       DECIMAL(5,2) CHECK (shoulder_to_bust       IS NULL OR (shoulder_to_bust       >= 1 AND shoulder_to_bust       <= 100)),
    shoulder_to_under_bust DECIMAL(5,2) CHECK (shoulder_to_under_bust IS NULL OR (shoulder_to_under_bust >= 1 AND shoulder_to_under_bust <= 100)),
    upper_bust             DECIMAL(5,2) CHECK (upper_bust             IS NULL OR (upper_bust             >= 1 AND upper_bust             <= 100)),
    bust                   DECIMAL(5,2) CHECK (bust                   IS NULL OR (bust                   >= 1 AND bust                   <= 100)),
    lower_bust             DECIMAL(5,2) CHECK (lower_bust             IS NULL OR (lower_bust             >= 1 AND lower_bust             <= 100)),
    waist                  DECIMAL(5,2) CHECK (waist                  IS NULL OR (waist                  >= 1 AND waist                  <= 100)),
    hip                    DECIMAL(5,2) CHECK (hip                    IS NULL OR (hip                    >= 1 AND hip                    <= 100)),
    seat                   DECIMAL(5,2) CHECK (seat                   IS NULL OR (seat                   >= 1 AND seat                   <= 100)),

    -- ── Lower Body ─────────────────────────────────────────────
    upper_thigh_round DECIMAL(5,2) CHECK (upper_thigh_round IS NULL OR (upper_thigh_round >= 1 AND upper_thigh_round <= 100)),
    mid_thigh_round   DECIMAL(5,2) CHECK (mid_thigh_round   IS NULL OR (mid_thigh_round   >= 1 AND mid_thigh_round   <= 100)),
    knee              DECIMAL(5,2) CHECK (knee              IS NULL OR (knee              >= 1 AND knee              <= 100)),
    calf              DECIMAL(5,2) CHECK (calf              IS NULL OR (calf              >= 1 AND calf              <= 100)),
    ankle             DECIMAL(5,2) CHECK (ankle             IS NULL OR (ankle             >= 1 AND ankle             <= 100)),
    crotch            DECIMAL(5,2) CHECK (crotch            IS NULL OR (crotch            >= 1 AND crotch            <= 100)),

    -- ── Garment Lengths ────────────────────────────────────────
    blouse_length DECIMAL(5,2) CHECK (blouse_length IS NULL OR (blouse_length >= 1 AND blouse_length <= 100)),
    shirt_length  DECIMAL(5,2) CHECK (shirt_length  IS NULL OR (shirt_length  >= 1 AND shirt_length  <= 100)),
    pant_length   DECIMAL(5,2) CHECK (pant_length   IS NULL OR (pant_length   >= 1 AND pant_length   <= 100)),
    top_length    DECIMAL(5,2) CHECK (top_length    IS NULL OR (top_length    >= 1 AND top_length    <= 100)),

    notes TEXT,                           -- special instructions

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurement_profiles_customer_id
    ON public.measurement_profiles(customer_id);

-- updated_at trigger (function already exists in the base schema)
DROP TRIGGER IF EXISTS update_measurement_profiles_updated_at ON public.measurement_profiles;
CREATE TRIGGER update_measurement_profiles_updated_at
    BEFORE UPDATE ON public.measurement_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS — staff only (ADMIN + CASHIER read/write; ADMIN-only delete)
-- ============================================================================
ALTER TABLE public.measurement_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view measurement profiles" ON public.measurement_profiles;
CREATE POLICY "Staff can view measurement profiles" ON public.measurement_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'CASHIER'))
    );

DROP POLICY IF EXISTS "Staff can insert measurement profiles" ON public.measurement_profiles;
CREATE POLICY "Staff can insert measurement profiles" ON public.measurement_profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'CASHIER'))
    );

DROP POLICY IF EXISTS "Staff can update measurement profiles" ON public.measurement_profiles;
CREATE POLICY "Staff can update measurement profiles" ON public.measurement_profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'CASHIER'))
    );

DROP POLICY IF EXISTS "Admins can delete measurement profiles" ON public.measurement_profiles;
CREATE POLICY "Admins can delete measurement profiles" ON public.measurement_profiles
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================================
-- Staff read access to customers — previously only a legacy is_admin()
-- policy existed, which silently blocks CASHIER from the customers list.
-- ============================================================================
DROP POLICY IF EXISTS "Staff can view customers" ON public.customers;
CREATE POLICY "Staff can view customers" ON public.customers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'CASHIER'))
    );
