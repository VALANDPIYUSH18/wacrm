-- ============================================================
-- 036_products_sku_unique_and_inventory_policy.sql
-- Add unique constraint for product SKU per account for idempotent upsert,
-- and allow agent role to insert inventory items.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_products_account_sku'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT uq_products_account_sku UNIQUE (account_id, sku);
  END IF;
END $$;

-- Update inventory_items insert policy to allow agents
DROP POLICY IF EXISTS "inventory_items_insert" ON inventory_items;
CREATE POLICY "inventory_items_insert" ON inventory_items
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));
