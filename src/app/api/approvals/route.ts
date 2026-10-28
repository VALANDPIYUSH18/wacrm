import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { createApprovalRequest } from '@/lib/governance/service';
import type { ApprovalRequestType } from '@/lib/governance/types';

/**
 * GET /api/approvals
 * List approval requests for current account (viewer+)
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, accountId } = await requireRole('viewer');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const requestType = searchParams.get('type');

    let query = supabase
      .from('approval_requests')
      .select('*, requester:profiles!requested_by(full_name, email), reviewer:profiles!reviewed_by(full_name, email)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (requestType) {
      query = query.eq('request_type', requestType);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * POST /api/approvals
 * Submit an approval request (agent+)
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent');
    const body = await request.json();

    const { requestType, entityType, entityId, requestedPayload } = body;

    if (!requestType || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'requestType, entityType, and entityId are required' },
        { status: 400 }
      );
    }

    const approval = await createApprovalRequest(supabase, {
      accountId,
      requestedBy: userId,
      requestType: requestType as ApprovalRequestType,
      entityType: String(entityType),
      entityId: String(entityId),
      requestedPayload: (requestedPayload as Record<string, unknown>) || {},
    });

    return NextResponse.json({ approval }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
