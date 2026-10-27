import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAccount, requireRole, toErrorResponse } from '@/lib/auth/account';

/**
 * GET /api/products
 * List all products for the active account
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('products')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * POST /api/products
 * Create a new product in the catalog (agent+)
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, accountId } = await requireRole('agent');
    const body = await request.json();

    const { title, description, price, currency = 'INR', sku, image_url, is_active = true } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Valid price >= 0 is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        account_id: accountId,
        title: title.trim(),
        description: description ? String(description).trim() : null,
        price: parsedPrice,
        currency: String(currency).trim().toUpperCase(),
        sku: sku ? String(sku).trim() : null,
        image_url: image_url ? String(image_url).trim() : null,
        is_active: Boolean(is_active),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
