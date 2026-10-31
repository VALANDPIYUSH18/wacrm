-- ============================================================
-- 034_enterprise_governance_and_approvals.sql
-- Enterprise Governance, Approvals (4-Eyes Principle),
-- Multi-Location Inventory & Ledger, Orders & Fulfillment,
-- and Immutable Audit Logging.
-- ============================================================

-- 1. Manager Approval Requests (4-Eyes Principle)
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('price_override', 'refund', 'contract_signature', 'bulk_broadcast', 'catalog_price_change')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL, -- e.g. 'deal', 'payment_order', 'product', 'broadcast'
  entity_id TEXT NOT NULL,
  requested_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  rejection_reason TEXT,
  approval_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_account_status ON approval_requests(account_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_account_created ON approval_requests(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(account_id, entity_type, entity_id);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- Viewers and agents can see approvals in their account
CREATE POLICY "approval_requests_select" ON approval_requests
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

-- Agents and above can create approval requests
CREATE POLICY "approval_requests_insert" ON approval_requests
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

-- Only admins and owners can update/review approval requests
CREATE POLICY "approval_requests_update" ON approval_requests
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

-- Only admins/owners can delete requests
CREATE POLICY "approval_requests_delete" ON approval_requests
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));


-- 2. Multi-Location Inventory Tracking
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL DEFAULT 'Main Warehouse',
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  reorder_threshold INTEGER NOT NULL DEFAULT 5 CHECK (reorder_threshold >= 0),
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_inventory_product_location UNIQUE (product_id, location_name)
);

CREATE INDEX IF NOT EXISTS idx_inventory_account ON inventory_items(account_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(account_id, sku);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_items_select" ON inventory_items
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

CREATE POLICY "inventory_items_insert" ON inventory_items
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "inventory_items_update" ON inventory_items
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "inventory_items_delete" ON inventory_items
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));


-- 3. Unified Orders & Order Items
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  shipping_address JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_order_number_per_account UNIQUE (account_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_account_status ON orders(account_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(account_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(account_id, created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select" ON orders
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

CREATE POLICY "orders_insert" ON orders
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "orders_update" ON orders
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "orders_delete" ON orders
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));


-- 4. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  sku TEXT,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_account ON order_items(account_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "order_items_update" ON order_items
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "order_items_delete" ON order_items
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));


-- 5. Enterprise Audit Logging (Immutable Activity Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g. 'approval.created', 'approval.approved', 'order.created', 'inventory.adjusted'
  entity_type TEXT NOT NULL, -- e.g. 'approval_request', 'order', 'inventory_item', 'payment_order'
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_account_created ON audit_logs(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(account_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(account_id, actor_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins and owners can review the compliance audit logs
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT
  USING (is_account_member(account_id, 'admin'));

-- System and agents can insert log events
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

-- No updates or deletes permitted (immutable append-only log)
