import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { generatePaymentLink } from '@/lib/commerce/service';
import type { PaymentGatewayProvider } from '@/lib/commerce/types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

function getAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/payments/create-link
 * Generate in-chat payment link and send WhatsApp message to customer (agent+)
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId, userId } = await requireRole('agent');
    const body = await request.json();

    const {
      conversationId,
      contactId,
      productId,
      title,
      description,
      amount,
      currency = 'INR',
      provider = 'razorpay',
    } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount > 0 is required' }, { status: 400 });
    }
    if (provider !== 'razorpay' && provider !== 'stripe') {
      return NextResponse.json({ error: 'Provider must be razorpay or stripe' }, { status: 400 });
    }

    const admin = getAdmin();

    // Look up conversation & contact details
    const { data: conv, error: convError } = await admin
      .from('conversations')
      .select('id, contact_id, contacts(id, phone, name)')
      .eq('id', conversationId)
      .eq('account_id', accountId)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const contactObj = conv.contacts as { phone?: string; name?: string } | null;
    const customerPhone = contactObj?.phone;

    // Generate link via service
    const linkResult = await generatePaymentLink(
      accountId,
      {
        conversationId,
        contactId: contactId || conv.contact_id,
        productId: productId || undefined,
        title: title.trim(),
        description: description ? String(description).trim() : undefined,
        amount: numAmount,
        currency: String(currency).trim().toUpperCase(),
        provider: provider as PaymentGatewayProvider,
      },
      customerPhone
    );

    // Format WhatsApp message text
    const currencySymbol = currency.toUpperCase() === 'INR' ? '₹' : `${currency.toUpperCase()} `;
    const descSection = description ? `\n_${description}_\n` : '\n';
    const messageText = `📦 *Payment Request: ${title.trim()}*\nAmount: *${currencySymbol}${numAmount.toLocaleString()}*${descSection}\n👉 Click here to complete your secure payment:\n${linkResult.paymentUrl}`;

    // Send WhatsApp message if WhatsApp integration is connected
    let sendResult: { messageId?: string; whatsappMessageId?: string } | null = null;
    try {
      sendResult = await sendMessageToConversation(admin, accountId, {
        conversationId,
        messageType: 'text',
        contentText: messageText,
      });
    } catch (waErr) {
      console.warn('Could not dispatch payment link via sendMessageToConversation directly:', waErr);
    }

    // If sendMessageToConversation already persisted the message, fetch it or record fallback
    let insertedMsg: Record<string, unknown> | null = null;
    if (sendResult?.messageId) {
      const { data } = await admin
        .from('messages')
        .select('*')
        .eq('id', sendResult.messageId)
        .single();
      insertedMsg = data;
    } else {
      const { data } = await admin
        .from('messages')
        .insert({
          account_id: accountId,
          conversation_id: conversationId,
          sender_type: 'agent',
          sender_id: userId,
          content_text: messageText,
          message_type: 'text',
          status: 'delivered',
          metadata: {
            type: 'payment_request',
            orderId: linkResult.orderId,
            provider,
            amount: numAmount,
            currency: currency.toUpperCase(),
            paymentUrl: linkResult.paymentUrl,
          },
        })
        .select()
        .single();
      insertedMsg = data;

      await admin
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: `Payment Request: ${currencySymbol}${numAmount}`,
        })
        .eq('id', conversationId);
    }

    return NextResponse.json({
      success: true,
      orderId: linkResult.orderId,
      paymentUrl: linkResult.paymentUrl,
      message: insertedMsg,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
