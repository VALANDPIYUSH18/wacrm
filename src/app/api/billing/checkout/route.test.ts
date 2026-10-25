import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

let mockUser: { id: string; email?: string } | null = {
  id: 'user-1',
  email: 'owner@example.com',
};
let mockProfile: { account_id: string; account_role: string } | null = {
  account_id: 'acct-1',
  account_role: 'owner',
};
let mockSubscription: { stripe_customer_id: string } | null = {
  stripe_customer_id: 'cus_123',
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(async () => {
            return {
              data: mockProfile,
              error: null,
            };
          }),
        }),
      }),
    }),
  })),
}));

const mockCheckoutSessionsCreate = vi.fn().mockResolvedValue({
  url: 'https://checkout.stripe.com/c/pay/cs_test_123',
});

const mockPortalSessionsCreate = vi.fn().mockResolvedValue({
  url: 'https://billing.stripe.com/p/session/portal_123',
});

const mockCustomersCreate = vi.fn().mockResolvedValue({
  id: 'cus_new_456',
});

vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    customers: {
      create: (...args: unknown[]) => mockCustomersCreate(...args),
    },
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockCheckoutSessionsCreate(...args),
      },
    },
    billingPortal: {
      sessions: {
        create: (...args: unknown[]) => mockPortalSessionsCreate(...args),
      },
    },
  },
}));

vi.mock('@/lib/billing/plans', () => ({
  SAAS_PLANS: {
    growth: {
      id: 'growth',
      name: 'Growth',
      priceMonthly: 79,
      stripePriceIdMonthly: 'price_growth_monthly',
      limits: { maxSeats: 5 },
    },
  },
}));

describe('Billing Checkout Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'user-1', email: 'owner@example.com' };
    mockProfile = { account_id: 'acct-1', account_role: 'owner' };
  });

  it('rejects unauthenticated users with 401', async () => {
    mockUser = null;
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planTier: 'growth' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects non-owner / non-admin users with 403', async () => {
    mockProfile = { account_id: 'acct-1', account_role: 'agent' };
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planTier: 'growth' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('creates checkout session for valid plan', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planTier: 'growth' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
    expect(mockCheckoutSessionsCreate).toHaveBeenCalled();
  });
});
