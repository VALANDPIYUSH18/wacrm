import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasMinRole, canManageMembers, canEditSettings, isPlatformAdmin } from './roles';

describe('Phase 1: Multi-Tenant Role & Account Boundary Security', () => {
  it('correctly orders hierarchy: owner > admin > agent > viewer', () => {
    expect(hasMinRole('owner', 'viewer')).toBe(true);
    expect(hasMinRole('admin', 'viewer')).toBe(true);
    expect(hasMinRole('agent', 'viewer')).toBe(true);
    expect(hasMinRole('viewer', 'viewer')).toBe(true);

    expect(hasMinRole('viewer', 'agent')).toBe(false);
    expect(hasMinRole('viewer', 'admin')).toBe(false);
    expect(hasMinRole('viewer', 'owner')).toBe(false);

    expect(hasMinRole('agent', 'admin')).toBe(false);
    expect(hasMinRole('admin', 'owner')).toBe(false);
    expect(hasMinRole('owner', 'admin')).toBe(true);
  });

  it('restricts team management to admin and owner', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('agent')).toBe(false);
    expect(canManageMembers('viewer')).toBe(false);
  });

  it('restricts settings edits to admin and owner', () => {
    expect(canEditSettings('owner')).toBe(true);
    expect(canEditSettings('admin')).toBe(true);
    expect(canEditSettings('agent')).toBe(false);
    expect(canEditSettings('viewer')).toBe(false);
  });

  it('verifies platform superadmin check requires PLATFORM_ADMIN_EMAILS and denies unlisted users', () => {
    const original = process.env.PLATFORM_ADMIN_EMAILS;
    process.env.PLATFORM_ADMIN_EMAILS = 'superadmin@platform.com, ops@platform.com';

    try {
      // Ordinary users
      expect(isPlatformAdmin('agent@tenant-a.com')).toBe(false);
      expect(isPlatformAdmin('owner@tenant-b.com')).toBe(false);
      expect(isPlatformAdmin(undefined)).toBe(false);

      // Listed platform superadmins
      expect(isPlatformAdmin('superadmin@platform.com')).toBe(true);
      expect(isPlatformAdmin('OPS@PLATFORM.COM')).toBe(true);
    } finally {
      process.env.PLATFORM_ADMIN_EMAILS = original;
    }
  });
});
