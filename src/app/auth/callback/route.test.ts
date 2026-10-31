import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const mockExchangeCodeForSession = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges code for session and redirects to next url', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new Request('https://wacrm-suwu.vercel.app/auth/callback?code=valid-code&next=/dashboard');
    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/dashboard');
  });

  it('sanitizes open-redirect attempts in next parameter', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const maliciousRequest = new Request(
      'https://wacrm-suwu.vercel.app/auth/callback?code=valid-code&next=//attacker.com/steal'
    );
    const response = await GET(maliciousRequest);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://wacrm-suwu.vercel.app/dashboard');
  });

  it('redirects to login with error when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('Expired code') });

    const request = new Request('https://wacrm-suwu.vercel.app/auth/callback?code=expired-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login?error=');
  });

  it('redirects to login when code is missing', async () => {
    const request = new Request('https://wacrm-suwu.vercel.app/auth/callback');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login?error=');
  });
});
