-- Allow CASHIER role to insert new products
CREATE POLICY "products_cashier_insert"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'CASHIER'
        )
    );

-- Allow CASHIER role to update existing products
-- Price-field stripping is enforced server-side in the updateProduct action.
CREATE POLICY "products_cashier_update"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'CASHIER'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'CASHIER'
        )
    );
