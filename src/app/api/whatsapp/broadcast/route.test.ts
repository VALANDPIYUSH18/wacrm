import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateBroadcast = vi.fn();
const mockDeliverBroadcast = vi.fn();
const mockAfter = vi.fn();

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    after: (fn: () => unknown) => {
      mockAfter(fn);
      fn();
    },
  };
});

vi.mock('@/lib/automations/admin-client', () => ({
  supabaseAdmin: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/whatsapp/broadcast-core', () => ({
  createBroadcast: (...args: unknown[]) => mockCreateBroadcast(...args),
  deliverBroadcast: (...args: unknown[]) => mockDeliverBroadcast(...args),
  BroadcastError: class BroadcastError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ success: true }),
  rateLimitResponse: vi.fn(),
  RATE_LIMITS: { broadcast: { max: 5, window: 60 } },
}));

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockProfileSingle,
        }),
      }),
    }),
  })),
}));

describe('WhatsApp Broadcast Server Dispatch Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'usr-1' } },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: { account_id: 'acc-1' },
      error: null,
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('no user') });
    const { POST } = await import('./route');
    const req = new Request('http://localhost:3000/api/whatsapp/broadcast', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('dispatches entire audience in a single server call and executes asynchronously in after()', async () => {
    mockCreateBroadcast.mockResolvedValueOnce({
      broadcastId: 'bc-999',
      templateName: 'sample_promo',
      templateLanguage: 'en_US',
      planned: [
        { recipientRowId: 'r1', phone: '+14155550001', params: ['Alice'] },
        { recipientRowId: 'r2', phone: '+14155550002', params: ['Bob'] },
      ],
      rejected: 0,
    });

    const { POST } = await import('./route');
    const req = new Request('http://localhost:3000/api/whatsapp/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Summer Sale',
        template_name: 'sample_promo',
        template_language: 'en_US',
        recipients: [
          { phone: '+14155550001', params: ['Alice'] },
          { phone: '+14155550002', params: ['Bob'] },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.broadcastId).toBe('bc-999');
    expect(data.total).toBe(2);

    expect(mockCreateBroadcast).toHaveBeenCalledWith(
      expect.anything(),
      'acc-1',
      'usr-1',
      expect.objectContaining({
        name: 'Summer Sale',
        templateName: 'sample_promo',
      })
    );
    expect(mockDeliverBroadcast).toHaveBeenCalled();
  });
});
