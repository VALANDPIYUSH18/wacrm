import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';

/**
 * PATCH /api/products/[id]
 * Update product (agent+)
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { supabase, accountId } = await requireRole('agent');
    const body = await request.json();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p < 0) {
        return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
      }
      updates.price = p;
    }
    if (body.currency !== undefined) updates.currency = String(body.currency).trim().toUpperCase();
    if (body.sku !== undefined) updates.sku = body.sku ? String(body.sku).trim() : null;
    if (body.image_url !== undefined) updates.image_url = body.image_url ? String(body.image_url).trim() : null;
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * DELETE /api/products/[id]
 * Remove product from catalog (admin+)
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { supabase, accountId } = await requireRole('admin');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
