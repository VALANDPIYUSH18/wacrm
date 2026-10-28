import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { reviewApprovalRequest } from '@/lib/governance/service';

/**
 * PATCH /api/approvals/[id]
 * Approve or reject an approval request (admin+)
 * Strictly enforces 4-eyes principle (reviewer cannot be requester)
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { supabase, accountId, userId } = await requireRole('admin');
    const body = await request.json();

    const { status, notes, rejectionReason } = body;

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Status must be approved or rejected' },
        { status: 400 }
      );
    }

    const updated = await reviewApprovalRequest(supabase, {
      accountId,
      requestId: id,
      reviewerId: userId,
      status,
      notes,
      rejectionReason,
    });

    return NextResponse.json({ approval: updated });
  } catch (err) {
    if (err instanceof Error && err.message.includes('4-Eyes Violation')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return toErrorResponse(err);
  }
}
