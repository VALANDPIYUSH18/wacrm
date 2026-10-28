-- ============================================================
-- Migration 035: Enforce unique conversation per (account_id, contact_id)
--
-- Inbound webhook messages from new contacts can arrive concurrently.
-- Without a unique constraint on (account_id, contact_id), both concurrent
-- requests can find no existing conversation and insert two conversations
-- for the same contact. Subsequent lookups using .single() fail with
-- PGRST116 ("multiple rows returned") and cascade into message loss.
--
-- This migration safely reassigns child records of any historical duplicates
-- to the most recent canonical conversation, cleans up the duplicates,
-- and adds a UNIQUE constraint to guarantee one conversation per contact.
-- ============================================================

DO $$
DECLARE
  rec RECORD;
  canonical_id UUID;
  dupe_id UUID;
BEGIN
  -- 1. Deduplicate any existing duplicate conversations per (account_id, contact_id)
  FOR rec IN
    SELECT account_id, contact_id
    FROM conversations
    WHERE account_id IS NOT NULL AND contact_id IS NOT NULL
    GROUP BY account_id, contact_id
    HAVING count(*) > 1
  LOOP
    -- Canonical is the one with the latest activity or newest creation
    SELECT id INTO canonical_id
    FROM conversations
    WHERE account_id = rec.account_id AND contact_id = rec.contact_id
    ORDER BY COALESCE(last_message_at, created_at) DESC, created_at DESC
    LIMIT 1;

    -- Reassign child rows for all other duplicates
    FOR dupe_id IN
      SELECT id
      FROM conversations
      WHERE account_id = rec.account_id AND contact_id = rec.contact_id AND id != canonical_id
    LOOP
      -- Repoint messages
      UPDATE messages SET conversation_id = canonical_id WHERE conversation_id = dupe_id;

      -- Repoint reactions if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_reactions') THEN
        UPDATE message_reactions SET conversation_id = canonical_id WHERE conversation_id = dupe_id;
      END IF;

      -- Repoint payment_orders if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_orders') THEN
        UPDATE payment_orders SET conversation_id = canonical_id WHERE conversation_id = dupe_id;
      END IF;

      -- Repoint notifications if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        UPDATE notifications SET conversation_id = canonical_id WHERE conversation_id = dupe_id;
      END IF;

      -- Repoint flow_runs if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flow_runs') THEN
        UPDATE flow_runs SET conversation_id = canonical_id WHERE conversation_id = dupe_id;
      END IF;

      -- Repoint approval_requests if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approval_requests') THEN
        UPDATE approval_requests SET conversation_id = canonical_id WHERE conversation_id = dupe_id;
      END IF;

      -- Delete the orphaned duplicate conversation
      DELETE FROM conversations WHERE id = dupe_id;
    END LOOP;
  END LOOP;
END $$;

-- 2. Add the UNIQUE constraint on (account_id, contact_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_conversations_account_contact'
      AND conrelid = 'conversations'::regclass
  ) THEN
    ALTER TABLE conversations
      ADD CONSTRAINT uq_conversations_account_contact
      UNIQUE (account_id, contact_id);
  END IF;
END $$;

-- 3. Create helpful lookup index if not exists
CREATE INDEX IF NOT EXISTS idx_conversations_account_contact
  ON conversations (account_id, contact_id);

-- 4. Atomic inventory adjustment RPC to prevent check-then-write races
CREATE OR REPLACE FUNCTION adjust_inventory_quantity(
  p_account_id UUID,
  p_product_id UUID,
  p_location_name TEXT,
  p_delta INTEGER DEFAULT NULL,
  p_new_quantity INTEGER DEFAULT NULL,
  p_reorder_threshold INTEGER DEFAULT NULL
)
RETURNS SETOF inventory_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item inventory_items;
BEGIN
  INSERT INTO inventory_items (
    account_id,
    product_id,
    location_name,
    quantity_on_hand,
    quantity_reserved,
    reorder_threshold
  )
  VALUES (
    p_account_id,
    p_product_id,
    COALESCE(p_location_name, 'Main Warehouse'),
    GREATEST(0, COALESCE(p_new_quantity, p_delta, 0)),
    0,
    GREATEST(0, COALESCE(p_reorder_threshold, 5))
  )
  ON CONFLICT (product_id, location_name)
  DO UPDATE SET
    quantity_on_hand = CASE
      WHEN p_new_quantity IS NOT NULL THEN GREATEST(0, p_new_quantity)
      WHEN p_delta IS NOT NULL THEN GREATEST(0, inventory_items.quantity_on_hand + p_delta)
      ELSE inventory_items.quantity_on_hand
    END,
    reorder_threshold = CASE
      WHEN p_reorder_threshold IS NOT NULL THEN GREATEST(0, p_reorder_threshold)
      ELSE inventory_items.reorder_threshold
    END,
    updated_at = now()
  RETURNING * INTO v_item;

  RETURN NEXT v_item;
END;
$$;

REVOKE ALL ON FUNCTION adjust_inventory_quantity(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION adjust_inventory_quantity(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory_quantity(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER) TO service_role;

