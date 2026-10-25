import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          upsert: mockUpsert,
          update: mockUpdate,
        };
      }
      return {};
    }),
  }),
}));

const mockConstructEvent = vi.fn();
const mockRetrieveSubscription = vi.fn();

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
    subscriptions: {
      retrieve: (...args: unknown[]) => mockRetrieveSubscription(...args),
    },
  },
}));

describe('Billing Webhook Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service_role_key',
    };
  });

  it('returns 400 when signature header is missing', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/billing/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles customer.subscription.created/updated successfully', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          metadata: {
            accountId: 'acct-1',
            planTier: 'growth',
          },
          items: {
            data: [
              {
                price: { id: 'price_growth' },
                current_period_start: 1700000000,
                current_period_end: 1702600000,
              },
            ],
          },
          cancel_at_period_end: false,
        },
      },
    });

    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/billing/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test_123',
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'acct-1',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
        plan_tier: 'growth',
        status: 'active',
      }),
      { onConflict: 'account_id' }
    );
  });
});
