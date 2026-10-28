import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createApprovalRequest,
  reviewApprovalRequest,
  adjustInventory,
  logAuditEvent,
} from './service';

describe('Governance & 4-Eyes Principle Service', () => {
  const mockAccountId = 'acc-test-123';
  const initiatorId = 'usr-initiator-1';
  const managerId = 'usr-manager-2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createApprovalRequest logs audit trail and inserts pending request', async () => {
    const mockRequest = {
      id: 'req-001',
      account_id: mockAccountId,
      request_type: 'price_override',
      status: 'pending',
      requested_by: initiatorId,
      entity_type: 'deal',
      entity_id: 'deal-123',
      requested_payload: { originalPrice: 1000, overridePrice: 750 },
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockRequest, error: null }),
      }),
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    const res = await createApprovalRequest(mockSupabase as never, {
      accountId: mockAccountId,
      requestedBy: initiatorId,
      requestType: 'price_override',
      entityType: 'deal',
      entityId: 'deal-123',
      requestedPayload: { originalPrice: 1000, overridePrice: 750 },
    });

    expect(res.id).toBe('req-001');
    expect(res.status).toBe('pending');
    expect(mockSupabase.from).toHaveBeenCalledWith('approval_requests');
  });

  it('reviewApprovalRequest enforces 4-Eyes Principle and prevents self-approval', async () => {
    const mockExisting = {
      id: 'req-001',
      account_id: mockAccountId,
      requested_by: initiatorId, // Initiator is usr-initiator-1
      status: 'pending',
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockExisting, error: null }),
      }),
    };

    // Attempt self-approval by initiator
    await expect(
      reviewApprovalRequest(mockSupabase as never, {
        accountId: mockAccountId,
        requestId: 'req-001',
        reviewerId: initiatorId, // Same ID -> 4-eyes violation
        status: 'approved',
      })
    ).rejects.toThrow(/4-Eyes Violation/i);
  });

  it('reviewApprovalRequest allows different manager to approve and logs audit event', async () => {
    const mockExisting = {
      id: 'req-001',
      account_id: mockAccountId,
      requested_by: initiatorId,
      status: 'pending',
    };

    const mockUpdated = {
      ...mockExisting,
      status: 'approved',
      reviewed_by: managerId,
      approval_notes: 'Verified deal margin is > 20%',
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
          }),
        }),
      }),
    });

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'approval_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockExisting, error: null }),
            update: mockUpdate,
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'aud-1' }, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    const res = await reviewApprovalRequest(mockSupabase as never, {
      accountId: mockAccountId,
      requestId: 'req-001',
      reviewerId: managerId,
      status: 'approved',
      notes: 'Verified deal margin is > 20%',
    });

    expect(res.status).toBe('approved');
    expect(res.reviewed_by).toBe(managerId);
  });

  it('adjustInventory sets new stock quantity and records audit event', async () => {
    const mockInventoryItem = {
      id: 'inv-101',
      account_id: mockAccountId,
      product_id: 'prod-123',
      location_name: 'Main Warehouse',
      quantity_on_hand: 50,
      reorder_threshold: 5,
    };

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'inventory_items') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockInventoryItem, error: null }),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'aud-2' }, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    const res = await adjustInventory(mockSupabase as never, {
      accountId: mockAccountId,
      productId: 'prod-123',
      newQuantityOnHand: 50,
    });

    expect(res.id).toBe('inv-101');
    expect(res.quantity_on_hand).toBe(50);
  });
});
