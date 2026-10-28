import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { PATCH } from './[id]/route';

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn((err) => new Response(JSON.stringify({ error: err.message }), { status: 500 })),
}));

vi.mock('@/lib/governance/service', () => ({
  createApprovalRequest: vi.fn(),
  reviewApprovalRequest: vi.fn(),
}));

import { requireRole } from '@/lib/auth/account';
import { createApprovalRequest, reviewApprovalRequest } from '@/lib/governance/service';

describe('Approvals API (/api/approvals)', () => {
  const mockAccountId = 'acc-test-123';
  const mockUserId = 'usr-test-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns list of approvals for active account', async () => {
    const mockApprovals = [
      { id: 'req-1', request_type: 'price_override', status: 'pending' },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockApprovals, error: null });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }),
    };

    vi.mocked(requireRole).mockResolvedValue({
      supabase: mockSupabase as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    const req = new NextRequest('http://localhost:3000/api/approvals');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requests).toHaveLength(1);
  });

  it('POST validates required fields and calls createApprovalRequest', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      supabase: {} as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    vi.mocked(createApprovalRequest).mockResolvedValue({
      id: 'req-new',
      status: 'pending',
      request_type: 'refund',
    } as never);

    const req = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestType: 'refund',
        entityType: 'payment_order',
        entityId: 'ord-123',
        requestedPayload: { amount: 500 },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.approval.id).toBe('req-new');
  });

  it('PATCH returns 403 when 4-Eyes Principle violation occurs', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      supabase: {} as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    vi.mocked(reviewApprovalRequest).mockRejectedValue(
      new Error('4-Eyes Violation: Initiators cannot review their own approval requests')
    );

    const req = new NextRequest('http://localhost:3000/api/approvals/req-123', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approved',
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: 'req-123' }) });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/4-Eyes Violation/i);
  });
});
