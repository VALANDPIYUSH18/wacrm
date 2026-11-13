-- ============================================================
-- 039_marketplace_csv_foundation.sql
-- First marketplace integration foundation.
--
-- This migration supports account-scoped marketplace connections
-- and CSV-imported orders. It does NOT connect to Meesho's private
-- APIs and stores no marketplace passwords or API secrets.
-- ============================================================

-- A WACRM account represents one seller workspace. Each seller's
-- marketplace connection and imported data stay inside that account.

CREATE TABLE IF NOT EXISTS marketplace_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('meesho')),
  connection_label TEXT NOT NULL,
  connection_method TEXT NOT NULL DEFAULT 'csv'
    CHECK (connection_method IN ('csv', 'official_api')),
  external_seller_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'paused', 'needs_attention')),
  last_imported_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_marketplace_connection_label
    UNIQUE (account_id, provider, connection_label),
  CONSTRAINT uq_marketplace_connection_id_account
    UNIQUE (id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_connections_account
  ON marketplace_connections(account_id, created_at DESC);

ALTER TABLE marketplace_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_connections_select" ON marketplace_connections;
CREATE POLICY "marketplace_connections_select" ON marketplace_connections
  FOR SELECT USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "marketplace_connections_insert" ON marketplace_connections;
CREATE POLICY "marketplace_connections_insert" ON marketplace_connections
  FOR INSERT WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS "marketplace_connections_update" ON marketplace_connections;
CREATE POLICY "marketplace_connections_update" ON marketplace_connections
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS "marketplace_connections_delete" ON marketplace_connections;
CREATE POLICY "marketplace_connections_delete" ON marketplace_connections
  FOR DELETE USING (is_account_member(account_id, 'owner'));


-- One row per attempted CSV import. The file itself is processed by
-- the application and is not retained in this table.
CREATE TABLE IF NOT EXISTS marketplace_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'completed_with_errors', 'failed')),
  total_rows INTEGER NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
  imported_rows INTEGER NOT NULL DEFAULT 0 CHECK (imported_rows >= 0),
  skipped_rows INTEGER NOT NULL DEFAULT 0 CHECK (skipped_rows >= 0),
  failed_rows INTEGER NOT NULL DEFAULT 0 CHECK (failed_rows >= 0),
  error_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_marketplace_batch_connection
    FOREIGN KEY (connection_id, account_id)
    REFERENCES marketplace_connections(id, account_id),
  CONSTRAINT uq_marketplace_batch_id_account
    UNIQUE (id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_batches_account_created
  ON marketplace_import_batches(account_id, created_at DESC);

ALTER TABLE marketplace_import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_import_batches_select" ON marketplace_import_batches;
CREATE POLICY "marketplace_import_batches_select" ON marketplace_import_batches
  FOR SELECT USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "marketplace_import_batches_insert" ON marketplace_import_batches;
CREATE POLICY "marketplace_import_batches_insert" ON marketplace_import_batches
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS "marketplace_import_batches_update" ON marketplace_import_batches;
CREATE POLICY "marketplace_import_batches_update" ON marketplace_import_batches
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));


-- Normalized marketplace order header. external_order_id + connection_id
-- prevents the same seller order being imported more than once.
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL,
  import_batch_id UUID,
  external_order_id TEXT NOT NULL,
  order_date TIMESTAMPTZ,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT,
  fulfillment_status TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  item_subtotal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (item_subtotal >= 0),
  shipping_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  source_status TEXT,
  source_row_number INTEGER CHECK (source_row_number IS NULL OR source_row_number > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_marketplace_order_connection
    FOREIGN KEY (connection_id, account_id)
    REFERENCES marketplace_connections(id, account_id),
  CONSTRAINT fk_marketplace_order_batch
    FOREIGN KEY (import_batch_id, account_id)
    REFERENCES marketplace_import_batches(id, account_id),
  CONSTRAINT uq_marketplace_order_external
    UNIQUE (connection_id, external_order_id),
  CONSTRAINT uq_marketplace_order_id_account
    UNIQUE (id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_account_date
  ON marketplace_orders(account_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_account_status
  ON marketplace_orders(account_id, fulfillment_status);

ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_orders_select" ON marketplace_orders;
CREATE POLICY "marketplace_orders_select" ON marketplace_orders
  FOR SELECT USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "marketplace_orders_insert" ON marketplace_orders;
CREATE POLICY "marketplace_orders_insert" ON marketplace_orders
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS "marketplace_orders_update" ON marketplace_orders;
CREATE POLICY "marketplace_orders_update" ON marketplace_orders
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));


-- Marketplace order lines. Product mapping is optional in this first
-- foundation because a marketplace SKU may not yet exist in WACRM.
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  marketplace_order_id UUID NOT NULL,
  external_order_item_id TEXT,
  external_product_id TEXT,
  sku TEXT,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  line_total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_marketplace_item_order
    FOREIGN KEY (marketplace_order_id, account_id)
    REFERENCES marketplace_orders(id, account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_order
  ON marketplace_order_items(account_id, marketplace_order_id);

ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_order_items_select" ON marketplace_order_items;
CREATE POLICY "marketplace_order_items_select" ON marketplace_order_items
  FOR SELECT USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS "marketplace_order_items_insert" ON marketplace_order_items;
CREATE POLICY "marketplace_order_items_insert" ON marketplace_order_items
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS "marketplace_order_items_update" ON marketplace_order_items;
CREATE POLICY "marketplace_order_items_update" ON marketplace_order_items
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

COMMENT ON TABLE marketplace_connections IS
  'Account-scoped marketplace seller connections; CSV is the initial supported method.';
COMMENT ON TABLE marketplace_import_batches IS
  'Audit record for marketplace CSV imports; uploaded file contents are not stored here.';
COMMENT ON TABLE marketplace_orders IS
  'Normalized, account-scoped external marketplace order headers.';
COMMENT ON TABLE marketplace_order_items IS
  'Normalized line items for imported marketplace orders.';
