import { NextResponse, after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'
import type { SendTimeParams } from '@/lib/whatsapp/template-send-builder'
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'
import {
  createBroadcast,
  deliverBroadcast,
  BroadcastError,
  type BroadcastRecipientInput,
} from '@/lib/whatsapp/broadcast-core'

export const maxDuration = 60

interface NewRecipient {
  phone?: string
  to?: string
  params?: string[]
  messageParams?: SendTimeParams
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Per-user broadcast budget: limits how often a user can start a campaign.
    const limit = checkRateLimit(`broadcast:${user.id}`, RATE_LIMITS.broadcast)
    if (!limit.success) {
      return rateLimitResponse(limit)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()
    const accountId = profile?.account_id as string | undefined
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const {
      name,
      recipients: newRecipients,
      phone_numbers,
      template_name,
      template_language,
      template_params,
    } = body

    let recipientInputs: BroadcastRecipientInput[] = []
    if (Array.isArray(newRecipients) && newRecipients.length > 0) {
      recipientInputs = (newRecipients as NewRecipient[]).map((r) => ({
        to: typeof r.to === 'string' ? r.to : typeof r.phone === 'string' ? r.phone : '',
        phone: typeof r.phone === 'string' ? r.phone : typeof r.to === 'string' ? r.to : '',
        params: Array.isArray(r.params) ? r.params : undefined,
        messageParams: r.messageParams,
      }))
    } else if (Array.isArray(phone_numbers) && phone_numbers.length > 0) {
      const shared: string[] = Array.isArray(template_params)
        ? template_params
        : []
      recipientInputs = (phone_numbers as string[]).map((phone) => ({
        to: phone,
        phone,
        params: shared,
      }))
    } else {
      return NextResponse.json(
        {
          error:
            'Provide either `recipients` (preferred) or `phone_numbers` — must be a non-empty array',
        },
        { status: 400 }
      )
    }

    if (!template_name) {
      return NextResponse.json(
        { error: 'template_name is required' },
        { status: 400 }
      )
    }

    const admin = supabaseAdmin()

    // Validate, resolve contacts, and insert broadcast + recipient rows.
    const plan = await createBroadcast(admin, accountId, user.id, {
      name: typeof name === 'string' ? name : null,
      templateName: template_name,
      templateLanguage: typeof template_language === 'string' ? template_language : null,
      recipients: recipientInputs,
    })

    // Asynchronously fan out to Meta in the background using the server engine.
    after(() => deliverBroadcast(admin, plan))

    return NextResponse.json({
      success: true,
      broadcastId: plan.broadcastId,
      broadcast_id: plan.broadcastId,
      total: plan.planned.length,
      sent: plan.planned.length,
      accepted: plan.planned.length,
      failed: plan.rejected,
      rejected: plan.rejected,
      results: plan.planned.map((p) => ({
        phone: p.phone,
        status: 'sent' as const,
      })),
    })
  } catch (error) {
    if (error instanceof BroadcastError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    console.error('Error in WhatsApp broadcast POST:', error)
    return NextResponse.json(
      { error: 'Failed to process broadcast' },
      { status: 500 }
    )
  }
}
