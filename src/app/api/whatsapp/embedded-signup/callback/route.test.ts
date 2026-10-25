import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

let mockUser: { id: string } | null = { id: 'user-1' };
let mockProfile: { account_id: string; account_role: string } | null = {
  account_id: 'acct-1',
  account_role: 'owner',
};

const mockUpsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(async () => ({
            data: mockProfile,
            error: null,
          })),
        }),
      }),
    }),
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: mockUpsert,
    }),
  }),
}));

vi.mock('@/lib/whatsapp/encryption', () => ({
  encrypt: vi.fn((val: string) => `enc_${val}`),
}));

vi.mock('@/lib/whatsapp/meta-api', () => ({
  verifyPhoneNumber: vi
    .fn()
    .mockResolvedValue({ verified_name: 'Test Business' }),
  subscribeWabaToApp: vi.fn().mockResolvedValue({ success: true }),
  registerPhoneNumber: vi.fn().mockResolvedValue({ success: true }),
}));

describe('WhatsApp Embedded Signup Callback Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      META_APP_ID: 'test-app-id',
      META_APP_SECRET: 'test-app-secret',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    };
    mockUser = { id: 'user-1' };
    mockProfile = { account_id: 'acct-1', account_role: 'owner' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockUser = null;
    const { POST } = await import('./route');
    const req = new NextRequest(
      'http://localhost:3000/api/whatsapp/embedded-signup/callback',
      {
        method: 'POST',
        body: JSON.stringify({
          code: 'c123',
          wabaId: 'waba123',
          phoneNumberId: 'pn123',
        }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('rejects non-owner/admin roles with 403', async () => {
    mockProfile = { account_id: 'acct-1', account_role: 'agent' };
    const { POST } = await import('./route');
    const req = new NextRequest(
      'http://localhost:3000/api/whatsapp/embedded-signup/callback',
      {
        method: 'POST',
        body: JSON.stringify({
          code: 'c123',
          wabaId: 'waba123',
          phoneNumberId: 'pn123',
        }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/Only workspace owners or admins/);
  });

  it('validates presence of code, wabaId, and phoneNumberId', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest(
      'http://localhost:3000/api/whatsapp/embedded-signup/callback',
      {
        method: 'POST',
        body: JSON.stringify({ code: 'c123' }), // Missing wabaId & phoneNumberId
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing code, wabaId, or phoneNumberId/);
  });

  it('successfully exchanges code, verifies number, and saves encrypted config', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'meta_access_token_xyz' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { POST } = await import('./route');
    const req = new NextRequest(
      'http://localhost:3000/api/whatsapp/embedded-signup/callback',
      {
        method: 'POST',
        body: JSON.stringify({
          code: 'auth_code_from_meta',
          wabaId: 'waba_999',
          phoneNumberId: 'pn_888',
        }),
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.phone_info).toEqual({ verified_name: 'Test Business' });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'acct-1',
        user_id: 'user-1',
        phone_number_id: 'pn_888',
        waba_id: 'waba_999',
        access_token_encrypted: 'enc_meta_access_token_xyz',
      }),
      { onConflict: 'account_id' }
    );
  });
});
