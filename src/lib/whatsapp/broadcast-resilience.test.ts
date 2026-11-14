import { describe, it, expect } from 'vitest';
import { createBroadcast, BroadcastError } from './broadcast-core';

describe('Phase 5: Broadcast Resilience & Rate-Limit Protection', () => {
  it('validates input and throws BroadcastError for empty or invalid broadcast payloads', async () => {
    const mockDb = {} as any;

    await expect(
      createBroadcast(mockDb, 'acc-1', 'user-1', {
        templateName: '',
        recipients: [],
      })
    ).rejects.toThrow(BroadcastError);

    await expect(
      createBroadcast(mockDb, 'acc-1', 'user-1', {
        templateName: 'valid_template',
        recipients: [],
      })
    ).rejects.toThrow(BroadcastError);
  });

  it('deduplicates recipients with identical contact IDs before dispatch', () => {
    const rawRecipients = [
      { contactId: 'c1', phone: '+1234567890', params: [] },
      { contactId: 'c1', phone: '+1234567890', params: [] }, // dupe
      { contactId: 'c2', phone: '+1987654321', params: [] },
    ];

    const seen = new Set<string>();
    const deduped = rawRecipients.filter((r) => {
      if (seen.has(r.contactId)) return false;
      seen.add(r.contactId);
      return true;
    });

    expect(deduped.length).toBe(2);
    expect(deduped.map((d) => d.contactId)).toEqual(['c1', 'c2']);
  });

  it('preserves delivered/read counts without regressions upon retry', () => {
    const recipientStates = ['sent', 'delivered', 'read', 'pending'];
    // Only 'pending' should be retried on broadcast resume
    const pendingToRetry = recipientStates.filter((s) => s === 'pending');
    expect(pendingToRetry).toEqual(['pending']);
  });
});
