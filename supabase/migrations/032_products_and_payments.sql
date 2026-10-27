-- ============================================================
-- 032_products_and_payments.sql
-- Products catalog, merchant payment gateways (Razorpay/Stripe),
-- and WhatsApp in-chat payment orders.
-- ============================================================

-- 1. Products catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  sku TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_account_active ON products(account_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_account_created ON products(account_id, created_at DESC);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON products
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

CREATE POLICY "products_insert" ON products
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "products_update" ON products
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "products_delete" ON products
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));


-- 2. Merchant Payment Gateway Configs (Razorpay & Stripe)
CREATE TABLE IF NOT EXISTS payment_gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  encrypted_publishable_key TEXT, -- e.g. Razorpay Key ID or Stripe Publishable Key
  encrypted_secret_key TEXT NOT NULL, -- AES-256-GCM encrypted
  encrypted_webhook_secret TEXT, -- AES-256-GCM encrypted
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payment_gateway_account_provider UNIQUE (account_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_gateway_account ON payment_gateway_configs(account_id);

ALTER TABLE payment_gateway_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_gateways_select" ON payment_gateway_configs
  FOR SELECT
  USING (is_account_member(account_id, 'admin'));

CREATE POLICY "payment_gateways_insert" ON payment_gateway_configs
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "payment_gateways_update" ON payment_gateway_configs
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "payment_gateways_delete" ON payment_gateway_configs
  FOR DELETE
  USING (is_account_member(account_id, 'owner'));


-- 3. In-Chat Payment Orders / Payment Links
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  provider_payment_link_id TEXT,
  payment_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_account ON payment_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_conversation ON payment_orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_provider_link ON payment_orders(provider_payment_link_id);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_orders_select" ON payment_orders
  FOR SELECT
  USING (is_account_member(account_id, 'viewer'));

CREATE POLICY "payment_orders_insert" ON payment_orders
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY "payment_orders_update" ON payment_orders
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));
