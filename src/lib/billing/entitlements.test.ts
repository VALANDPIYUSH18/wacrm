import { describe, it, expect, vi } from 'vitest';
import { getAccountEntitlements } from './entitlements';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('getAccountEntitlements', () => {
  it('enforces seat limit when seats reach plan capacity', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'subscriptions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                plan_tier: 'starter',
                status: 'active',
                current_period_end: new Date(Date.now() + 86400000).toISOString(),
              },
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ count: 2 }),
          };
        }
        if (table === 'account_invitations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            gt: vi.fn().mockResolvedValue({ count: 0 }),
          };
        }
        if (table === 'broadcasts') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ count: 15 }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
        };
      }),
    } as unknown as SupabaseClient;

    const res = await getAccountEntitlements(mockSupabase, 'acc-123');

    expect(res.planTier).toBe('starter');
    expect(res.maxSeats).toBe(2);
    expect(res.currentSeats).toBe(2);
    expect(res.canInviteSeat).toBe(false); // Starter plan allows 2 seats max
  });

  it('allows seat invitations when below plan capacity', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'subscriptions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                plan_tier: 'growth',
                status: 'active',
                current_period_end: new Date(Date.now() + 86400000).toISOString(),
              },
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ count: 2 }),
          };
        }
        if (table === 'account_invitations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            gt: vi.fn().mockResolvedValue({ count: 1 }),
          };
        }
        if (table === 'broadcasts') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ count: 50 }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
        };
      }),
    } as unknown as SupabaseClient;

    const res = await getAccountEntitlements(mockSupabase, 'acc-123');

    expect(res.planTier).toBe('growth');
    expect(res.maxSeats).toBe(5);
    expect(res.currentSeats).toBe(3);
    expect(res.canInviteSeat).toBe(true);
  });
});
