import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getGatewayConfig } from '@/lib/commerce/gateway';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

function getAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/payments/webhook/razorpay
 * Listens for payment_link.paid / payment.captured events from Razorpay
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Identify account / order
    const paymentLinkEntity = event?.payload?.payment_link?.entity;
    const paymentEntity = event?.payload?.payment?.entity;
    const notes = paymentLinkEntity?.notes || paymentEntity?.notes || {};
    const orderId = notes.orderId;
    const accountId = notes.accountId;

    const admin = getAdmin();

    // Look up order if orderId is available
    let order: any = null;
    if (orderId) {
      const { data } = await admin
        .from('payment_orders')
        .select('*, products(title)')
        .eq('id', orderId)
        .maybeSingle();
      order = data;
    } else if (paymentLinkEntity?.id) {
      const { data } = await admin
        .from('payment_orders')
        .select('*, products(title)')
        .eq('provider_payment_link_id', paymentLinkEntity.id)
        .maybeSingle();
      order = data;
    }

    const targetAccountId = accountId || order?.account_id;

    // Verify webhook signature if configured
    if (targetAccountId) {
      const config = await getGatewayConfig(targetAccountId, 'razorpay');
      if (config?.webhookSecret && signature) {
        const expectedSignature = crypto
          .createHmac('sha256', config.webhookSecret)
          .update(rawBody)
          .digest('hex');

        if (expectedSignature !== signature) {
          console.warn('Razorpay webhook HMAC signature mismatch');
          return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
        }
      }
    }

    // Process payment success events
    const eventType = event.event;
    if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
      if (order && order.status !== 'paid') {
        // Mark payment order as paid
        await admin
          .from('payment_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        // Fetch contact phone & conversation
        if (order.conversation_id) {
          const { data: conv } = await admin
            .from('conversations')
            .select('id, contact_id, contacts(phone, name)')
            .eq('id', order.conversation_id)
            .single();

          const contactPhone = (conv?.contacts as any)?.phone;
          const currencySymbol = order.currency === 'INR' ? '₹' : `${order.currency} `;
          const itemTitle = order.products?.title || 'your order';

          const receiptMessage = `✅ *Payment Received!*\n\nWe have received your payment of *${currencySymbol}${Number(order.amount).toLocaleString()}* for *${itemTitle}*.\n\nTransaction ID: \`${paymentEntity?.id || paymentLinkEntity?.id || order.id.slice(0, 8)}\`\nStatus: *Completed*\n\nThank you for your purchase!`;

          // Send confirmation over WhatsApp using core helper
          let sent = false;
          try {
            await sendMessageToConversation(admin, order.account_id, {
              conversationId: order.conversation_id,
              messageType: 'text',
              contentText: receiptMessage,
            });
            sent = true;
          } catch (sendErr) {
            console.error('Failed to dispatch receipt via sendMessageToConversation:', sendErr);
          }

          if (!sent) {
            // Fallback insert if WhatsApp not configured
            await admin.from('messages').insert({
              account_id: order.account_id,
              conversation_id: order.conversation_id,
              sender_type: 'bot',
              content_text: receiptMessage,
              message_type: 'text',
              status: 'delivered',
              metadata: {
                type: 'payment_receipt',
                orderId: order.id,
                provider: 'razorpay',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    );
  }
}
