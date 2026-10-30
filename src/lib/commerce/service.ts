import { getGatewayConfig } from './gateway';
import type { CreatePaymentLinkParams } from './types';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let _adminClient: SupabaseClient | null = null;
function getAdmin(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export interface GeneratedPaymentLink {
  orderId: string;
  paymentUrl: string;
  providerPaymentLinkId: string;
}

/**
 * Creates a payment link via Razorpay Payment Links API v1
 */
async function createRazorpayLink(
  config: { publishableKey: string | null; secretKey: string },
  params: CreatePaymentLinkParams & { accountId: string; orderId: string; customerPhone?: string }
): Promise<{ paymentUrl: string; providerPaymentLinkId: string }> {
  // Amount in paise (e.g. 500 INR = 50000 paise)
  const amountInPaise = Math.round(params.amount * 100);
  const keyId = config.publishableKey || '';
  const keySecret = config.secretKey;

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  const body: Record<string, unknown> = {
    amount: amountInPaise,
    currency: params.currency.toUpperCase(),
    accept_partial: false,
    description: params.description || params.title,
    notes: {
      orderId: params.orderId,
      conversationId: params.conversationId,
      accountId: params.accountId,
    },
  };

  // Razorpay customer contact requires digits only (optional country code, min 8 digits)
  if (params.customerPhone) {
    const cleanPhone = params.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 8) {
      body.customer = {
        contact: cleanPhone.startsWith('91') && cleanPhone.length === 12 ? `+${cleanPhone}` : cleanPhone,
      };
    }
  }

  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.description || 'Razorpay payment link creation failed');
  }

  return {
    paymentUrl: data.short_url,
    providerPaymentLinkId: data.id,
  };
}

/**
 * Creates a payment link via Stripe Checkout API
 */
async function createStripeLink(
  config: { secretKey: string },
  params: CreatePaymentLinkParams & { accountId: string; orderId: string }
): Promise<{ paymentUrl: string; providerPaymentLinkId: string }> {
  const amountInCents = Math.round(params.amount * 100);

  const formBody = new URLSearchParams({
    'mode': 'payment',
    'line_items[0][price_data][currency]': params.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': amountInCents.toString(),
    'line_items[0][price_data][product_data][name]': params.title,
    'success_url': 'https://wacrm-peach-iota.vercel.app',
    'metadata[orderId]': params.orderId,
    'metadata[conversationId]': params.conversationId,
    'metadata[accountId]': params.accountId,
  });

  if (params.description) {
    formBody.set('line_items[0][price_data][product_data][description]', params.description);
  }

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Stripe checkout session creation failed');
  }

  return {
    paymentUrl: data.url,
    providerPaymentLinkId: data.id,
  };
}

export async function generatePaymentLink(
  accountId: string,
  params: CreatePaymentLinkParams,
  customerPhone?: string
): Promise<GeneratedPaymentLink> {
  const config = await getGatewayConfig(accountId, params.provider);
  if (!config || !config.isActive) {
    throw new Error(
      `Payment gateway "${params.provider}" is not configured or active for your workspace.`
    );
  }

  const admin = getAdmin();
  const orderId = crypto.randomUUID();

  let linkResult: { paymentUrl: string; providerPaymentLinkId: string };

  if (params.provider === 'razorpay') {
    linkResult = await createRazorpayLink(
      { publishableKey: config.publishableKey, secretKey: config.secretKey },
      { ...params, accountId, orderId, customerPhone }
    );
  } else {
    linkResult = await createStripeLink(
      { secretKey: config.secretKey },
      { ...params, accountId, orderId }
    );
  }

  // Record payment order
  const { error } = await admin.from('payment_orders').insert({
    id: orderId,
    account_id: accountId,
    conversation_id: params.conversationId,
    contact_id: params.contactId || null,
    product_id: params.productId || null,
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    provider: params.provider,
    provider_payment_link_id: linkResult.providerPaymentLinkId,
    payment_url: linkResult.paymentUrl,
    status: 'pending',
  });

  if (error) {
    console.error('Failed to record payment order:', error);
  }

  return {
    orderId,
    paymentUrl: linkResult.paymentUrl,
    providerPaymentLinkId: linkResult.providerPaymentLinkId,
  };
}
