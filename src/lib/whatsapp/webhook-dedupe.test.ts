import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from './status-transition';

describe('Phase 2: WhatsApp Webhook Deduplication & Monotonicity', () => {

  it('allows forward transitions along status ladder', () => {
    expect(isValidStatusTransition('sent', 'delivered')).toBe(true);
    expect(isValidStatusTransition('delivered', 'read')).toBe(true);
    expect(isValidStatusTransition('read', 'replied')).toBe(true);
  });

  it('rejects backwards regressions (delivered after read)', () => {
    expect(isValidStatusTransition('read', 'delivered')).toBe(false);
    expect(isValidStatusTransition('delivered', 'sent')).toBe(false);
    expect(isValidStatusTransition('replied', 'read')).toBe(false);
  });

  it('rejects terminal failed status if message was already delivered or read', () => {
    expect(isValidStatusTransition('delivered', 'failed')).toBe(false);
    expect(isValidStatusTransition('read', 'failed')).toBe(false);
    expect(isValidStatusTransition('sent', 'failed')).toBe(true);
  });
});
