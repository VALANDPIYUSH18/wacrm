import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { getGatewayConfig, saveGatewayConfig } from '@/lib/commerce/gateway';
import type { PaymentGatewayProvider } from '@/lib/commerce/types';

function maskKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

/**
 * GET /api/payments/config
 * Returns configured status and masked keys for active account (admin+)
 */
export async function GET() {
  try {
    const { accountId } = await requireRole('admin');

    const [razorpay, stripe] = await Promise.all([
      getGatewayConfig(accountId, 'razorpay'),
      getGatewayConfig(accountId, 'stripe'),
    ]);

    return NextResponse.json({
      razorpay: razorpay
        ? {
            provider: 'razorpay',
            isActive: razorpay.isActive,
            publishableKey: razorpay.publishableKey,
            hasSecretKey: Boolean(razorpay.secretKey),
            hasWebhookSecret: Boolean(razorpay.webhookSecret),
            maskedPublishableKey: maskKey(razorpay.publishableKey),
          }
        : {
            provider: 'razorpay',
            isActive: false,
            publishableKey: null,
            hasSecretKey: false,
            hasWebhookSecret: false,
            maskedPublishableKey: null,
          },
      stripe: stripe
        ? {
            provider: 'stripe',
            isActive: stripe.isActive,
            publishableKey: stripe.publishableKey,
            hasSecretKey: Boolean(stripe.secretKey),
            hasWebhookSecret: Boolean(stripe.webhookSecret),
            maskedPublishableKey: maskKey(stripe.publishableKey),
          }
        : {
            provider: 'stripe',
            isActive: false,
            publishableKey: null,
            hasSecretKey: false,
            hasWebhookSecret: false,
            maskedPublishableKey: null,
          },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * POST /api/payments/config
 * Update Razorpay or Stripe payment gateway keys (admin+)
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId } = await requireRole('admin');
    const body = await request.json();

    const provider = body.provider as PaymentGatewayProvider;
    if (provider !== 'razorpay' && provider !== 'stripe') {
      return NextResponse.json({ error: 'Valid provider (razorpay | stripe) is required' }, { status: 400 });
    }

    const payload: {
      isActive?: boolean;
      publishableKey?: string | null;
      secretKey?: string;
      webhookSecret?: string | null;
    } = {};

    if (body.isActive !== undefined) {
      payload.isActive = Boolean(body.isActive);
    }
    if (body.publishableKey !== undefined) {
      payload.publishableKey = body.publishableKey ? String(body.publishableKey).trim() : null;
    }
    if (body.secretKey) {
      payload.secretKey = String(body.secretKey).trim();
    }
    if (body.webhookSecret !== undefined) {
      payload.webhookSecret = body.webhookSecret ? String(body.webhookSecret).trim() : null;
    }

    await saveGatewayConfig(accountId, provider, payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
