import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';

export const DEMO_PRODUCTS = [
  {
    title: 'WACRM Starter Plan',
    sku: 'WACRM-001',
    category: 'Software Subscription',
    price: 999,
    currency: 'INR',
    description: 'WhatsApp shared inbox, contact management, and basic automation.',
    is_active: true,
  },
  {
    title: 'WACRM Business Plan',
    sku: 'WACRM-002',
    category: 'Software Subscription',
    price: 2499,
    currency: 'INR',
    description: 'Team inbox, sales pipeline, automation, and reporting.',
    is_active: true,
  },
  {
    title: 'WACRM Enterprise Plan',
    sku: 'WACRM-003',
    category: 'Software Subscription',
    price: 9999,
    currency: 'INR',
    description: 'Advanced team management, integrations, and business workflows.',
    is_active: true,
  },
  {
    title: 'CRM Setup & Configuration',
    sku: 'SRV-001',
    category: 'Professional Services',
    price: 4999,
    currency: 'INR',
    description: 'Initial CRM configuration, user setup, and workflow customization.',
    is_active: true,
  },
  {
    title: 'WhatsApp Automation Setup',
    sku: 'SRV-002',
    category: 'Professional Services',
    price: 2999,
    currency: 'INR',
    description: 'Automated replies, lead capture, and follow-up workflow setup.',
    is_active: true,
  },
  {
    title: 'ERP Integration Service',
    sku: 'SRV-003',
    category: 'Professional Services',
    price: 14999,
    currency: 'INR',
    description: 'Demo integration service for CRM and ERP contact synchronization.',
    is_active: true,
  },
  {
    title: 'Wireless Barcode Scanner',
    sku: 'HW-001',
    category: 'Electronics',
    price: 2499,
    currency: 'INR',
    description: 'Demo product for inventory and retail businesses.',
    is_active: true,
  },
  {
    title: 'Business Notebook Pack',
    sku: 'OFF-001',
    category: 'Office Supplies',
    price: 299,
    currency: 'INR',
    description: 'Pack of five notebooks for business and office use.',
    is_active: true,
  },
];

/**
 * POST /api/products/seed
 * Seed the standard demo products into the active account
 */
export async function POST(_request: NextRequest) {
  try {
    const { supabase, accountId } = await requireRole('agent');

    const records = DEMO_PRODUCTS.map((item) => ({
      ...item,
      account_id: accountId,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('products')
      .upsert(records, { onConflict: 'account_id,sku' })
      .select();

    if (error) {
      // If no unique constraint on (account_id, sku) yet, insert missing ones
      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(records)
        .select();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ count: inserted?.length || 0, products: inserted });
    }

    return NextResponse.json({ count: data?.length || 0, products: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
