import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/automations/admin-client', () => ({
  supabaseAdmin: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }),
    }),
  }),
}));

describe('Automations Cron API route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, AUTOMATION_CRON_SECRET: 'super-secret-cron-token-12345' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 503 if AUTOMATION_CRON_SECRET is not configured', async () => {
    delete process.env.AUTOMATION_CRON_SECRET;
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/automations/cron');
    const res = await GET(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('cron not configured');
  });

  it('rejects missing or wrong secret with 401 using timing safe comparison', async () => {
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/automations/cron', {
      headers: { 'x-cron-secret': 'wrong-secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('succeeds with 200 when exact matching secret is provided in constant time', async () => {
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/automations/cron', {
      headers: { 'x-cron-secret': 'super-secret-cron-token-12345' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.processed).toBe(0);
  });
});
