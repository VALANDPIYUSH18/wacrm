import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth/account', () => ({
  requireRole: vi.fn(),
  toErrorResponse: vi.fn((err) => new Response(JSON.stringify({ error: err.message }), { status: 500 })),
}));

vi.mock('@/lib/commerce/service', () => ({
  generatePaymentLink: vi.fn(),
}));

vi.mock('@/lib/whatsapp/send-message', () => ({
  sendMessageToConversation: vi.fn(),
}));

const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}));

import { requireRole } from '@/lib/auth/account';
import { generatePaymentLink } from '@/lib/commerce/service';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

describe('Payment Link Creation API (/api/payments/create-link)', () => {
  const mockAccountId = 'acc-test-123';
  const mockUserId = 'usr-test-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects missing conversationId', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      supabase: {} as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    const req = new NextRequest('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Consultation',
        amount: 500,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/conversationId is required/i);
  });

  it('rejects invalid or non-positive amount', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      supabase: {} as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    const req = new NextRequest('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        title: 'Consultation',
        amount: -100,
        currency: 'INR',
        provider: 'razorpay',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Valid amount > 0/i);
  });

  it('creates payment order and dispatches WhatsApp payment link to conversation', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      supabase: {} as never,
      accountId: mockAccountId,
      userId: mockUserId,
    } as never);

    mockSupabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'conv-123',
              contact_id: 'cont-123',
              contacts: { id: 'cont-123', phone: '+919876543210', name: 'Rohan Sharma' },
            },
            error: null,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      if (table === 'messages') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'msg-payment-1', content_text: 'Payment Link' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    vi.mocked(generatePaymentLink).mockResolvedValue({
      orderId: 'ord-123',
      paymentUrl: 'https://rzp.io/i/testOrder',
      providerPaymentLinkId: 'plink_999',
    });

    vi.mocked(sendMessageToConversation).mockRejectedValue(new Error('WhatsApp service not connected'));

    const req = new NextRequest('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        title: 'Starter Pack',
        amount: 999,
        currency: 'INR',
        provider: 'razorpay',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orderId).toBe('ord-123');
    expect(json.paymentUrl).toBe('https://rzp.io/i/testOrder');
  });
});
