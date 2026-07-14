-- ============================================================================
-- ADD SEAT / KNEE / SHIRT LENGTH to measurement_profiles
-- (Pratyagra Designer measurement sheet — Torso, Lower Body, Garment Lengths)
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- Same DECIMAL(5,2) + 1–100 CHECK convention as the base table.
-- ============================================================================

ALTER TABLE public.measurement_profiles
    ADD COLUMN IF NOT EXISTS seat         DECIMAL(5,2) CHECK (seat         IS NULL OR (seat         >= 1 AND seat         <= 100)),
    ADD COLUMN IF NOT EXISTS knee         DECIMAL(5,2) CHECK (knee         IS NULL OR (knee         >= 1 AND knee         <= 100)),
    ADD COLUMN IF NOT EXISTS shirt_length DECIMAL(5,2) CHECK (shirt_length IS NULL OR (shirt_length >= 1 AND shirt_length <= 100));
