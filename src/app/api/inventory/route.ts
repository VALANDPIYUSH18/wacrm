import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { adjustInventory } from '@/lib/governance/service';

/**
 * GET /api/inventory
 * List inventory items across locations (viewer+)
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, accountId } = await requireRole('viewer');
    const { searchParams } = new URL(request.url);

    const location = searchParams.get('location');
    const productId = searchParams.get('productId');

    let query = supabase
      .from('inventory_items')
      .select('*, product:products(id, title, sku, price, currency)')
      .eq('account_id', accountId)
      .order('updated_at', { ascending: false });

    if (location) {
      query = query.eq('location_name', location);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * POST /api/inventory
 * Adjust stock or create inventory entry (agent+)
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent');
    const body = await request.json();

    const { productId, locationName, quantityOnHandDelta, newQuantityOnHand, reorderThreshold } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const item = await adjustInventory(supabase, {
      accountId,
      actorId: userId,
      productId,
      locationName,
      quantityOnHandDelta: quantityOnHandDelta !== undefined ? Number(quantityOnHandDelta) : undefined,
      newQuantityOnHand: newQuantityOnHand !== undefined ? Number(newQuantityOnHand) : undefined,
      reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : undefined,
    });

    return NextResponse.json({ item });
  } catch (err) {
    return toErrorResponse(err);
  }
}
