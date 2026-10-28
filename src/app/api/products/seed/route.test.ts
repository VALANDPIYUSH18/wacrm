import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { INITIAL_DEMO_PRODUCTS } from '@/lib/commerce/demo-store';

const mockUpsert = vi.fn();
const mockRequireRole = vi.fn();

vi.mock('@/lib/auth/account', () => ({
  requireRole: () => mockRequireRole(),
  toErrorResponse: (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  },
}));

describe('Products Seed API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('all INITIAL_DEMO_PRODUCTS IDs are valid RFC 4122 UUID strings', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(INITIAL_DEMO_PRODUCTS.length).toBeGreaterThan(0);
    for (const item of INITIAL_DEMO_PRODUCTS) {
      expect(item.id).toMatch(uuidRegex);
    }
  });

  it('seeds products omitting hardcoded IDs so Postgres can generate default UUIDs', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: mockUpsert.mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [{ id: '11111111-2222-4333-8444-555555555555', title: 'Product 1' }],
            error: null,
          }),
        }),
      }),
    };

    mockRequireRole.mockResolvedValue({
      supabase: mockSupabase,
      accountId: 'acc-123',
    });

    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost:3000/api/products/seed', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(1);

    // Verify records passed to upsert do NOT contain hardcoded static IDs
    const calledRecords = mockUpsert.mock.calls[0][0];
    expect(Array.isArray(calledRecords)).toBe(true);
    for (const record of calledRecords) {
      expect(record.id).toBeUndefined();
      expect(record.account_id).toBe('acc-123');
    }
  });
});
