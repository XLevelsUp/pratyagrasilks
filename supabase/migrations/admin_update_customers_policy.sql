-- ============================================================================
-- ADMIN UPDATE CUSTOMERS — RLS policy for the Edit Customer feature
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Until now the only UPDATE policy on customers was the self-update
-- (auth.uid() = id); admin edits happened via the service-role client only.
-- This lets ADMIN (not CASHIER) correct customer details through the normal
-- RLS client — cashiers create walk-ins, admins fix mistakes.
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
CREATE POLICY "Admins can update customers" ON public.customers
    FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );
