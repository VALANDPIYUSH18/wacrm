-- ============================================================
-- 031_billing_subscriptions.sql — Subscriptions & SaaS Billing
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
    CREATE TYPE subscription_status_enum AS ENUM (
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'starter', -- 'starter', 'growth', 'scale'
  status subscription_status_enum NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One subscription record per account
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_account_id
  ON subscriptions(account_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS POLICIES FOR SUBSCRIPTIONS
-- Only account members can view the subscription.
-- Only service role (via webhooks) or owner can modify.
-- ============================================================
DROP POLICY IF EXISTS subscriptions_select ON subscriptions;
CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (is_account_member(account_id, 'viewer'));

DROP POLICY IF EXISTS subscriptions_modify ON subscriptions;
CREATE POLICY subscriptions_modify ON subscriptions
  FOR ALL USING (is_account_member(account_id, 'owner'));

-- Backfill existing accounts with a default trialing subscription if none exists
INSERT INTO subscriptions (account_id, plan_tier, status, current_period_end)
SELECT
  id as account_id,
  'growth' as plan_tier,
  'trialing' as status,
  NOW() + INTERVAL '14 days' as current_period_end
FROM accounts
ON CONFLICT (account_id) DO NOTHING;
