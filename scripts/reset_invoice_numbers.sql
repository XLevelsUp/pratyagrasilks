-- ============================================================================
-- Reset Invoice Numbers
-- Run ONCE in Supabase SQL Editor after deleting orders to close gaps.
-- Re-numbers all orders INV-001, INV-002, … (oldest first by created_at)
-- and resets the sequence so the next new order continues correctly.
-- ============================================================================

DO $$
DECLARE
    rec    RECORD;
    seq_n  INT := 1;
BEGIN
    -- 1. Clear all invoice numbers to avoid UNIQUE constraint conflicts
    UPDATE orders SET invoice_number = NULL;

    -- 2. Re-assign sequentially, oldest order first
    FOR rec IN
        SELECT id FROM orders ORDER BY created_at ASC
    LOOP
        UPDATE orders
        SET invoice_number = 'INV-' || LPAD(seq_n::text, 3, '0')
        WHERE id = rec.id;
        seq_n := seq_n + 1;
    END LOOP;

    -- 3. Reset the DB sequence so the next INSERT gets the right next number
    PERFORM setval('invoice_seq', seq_n - 1);

    RAISE NOTICE 'Done. % orders renumbered. Sequence reset to %.', seq_n - 1, seq_n - 1;
END;
$$;

-- ============================================================================
-- Verification — run after the block above to confirm results
-- ============================================================================

-- All orders with their new invoice numbers (should be gap-free)
SELECT
    invoice_number,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS expected_seq
FROM orders
ORDER BY created_at ASC;

-- Sequence current value (should equal total order count)
SELECT last_value FROM invoice_seq;
SELECT COUNT(*) AS total_orders FROM orders;
