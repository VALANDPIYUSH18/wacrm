import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/account', () => ({
  getCurrentAccount: vi.fn(),
  requireRole: vi.fn(),
  toErrorResponse: vi.fn((err) => new Response(JSON.stringify({ error: err.message }), { status: 500 })),
}));

import { getCurrentAccount, requireRole } from '@/lib/auth/account';

describe('Products API (/api/products)', () => {
  const mockAccountId = 'acc-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns products list for current account', async () => {
    const mockProducts = [
      { id: 'prod-1', title: 'Consultation', price: 1000, currency: 'INR', is_active: true },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockProducts, error: null });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }),
    };

    (getCurrentAccount as any).mockResolvedValue({
      supabase: mockSupabase,
      accountId: mockAccountId,
    });

    const req = new NextRequest('http://localhost:3000/api/products');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.products).toHaveLength(1);
    expect(json.products[0].title).toBe('Consultation');
  });

  it('POST validates required fields and creates product', async () => {
    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'prod-new', title: 'Workshop Pass', price: 2500, currency: 'INR' },
      error: null,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      }),
    };

    (requireRole as any).mockResolvedValue({
      supabase: mockSupabase,
      accountId: mockAccountId,
    });

    const req = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Workshop Pass',
        price: 2500,
        currency: 'INR',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.product.title).toBe('Workshop Pass');
  });

  it('POST rejects invalid negative price', async () => {
    (requireRole as any).mockResolvedValue({
      supabase: {},
      accountId: mockAccountId,
    });

    const req = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Invalid Product',
        price: -50,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
