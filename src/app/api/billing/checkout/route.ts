import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { SAAS_PLANS, type PlanTier } from '@/lib/billing/plans';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.',
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id, account_role')
      .eq('id', user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json(
        { error: 'No associated account found.' },
        { status: 400 }
      );
    }

    if (profile.account_role !== 'owner' && profile.account_role !== 'admin') {
      return NextResponse.json(
        { error: 'Only account owners and admins can manage billing.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const planTier = body.planTier as PlanTier;

    if (!planTier || !SAAS_PLANS[planTier]) {
      return NextResponse.json(
        { error: 'Invalid plan selected.' },
        { status: 400 }
      );
    }

    const plan = SAAS_PLANS[planTier];
    if (!plan.stripePriceIdMonthly) {
      return NextResponse.json(
        { error: `No Stripe Price ID configured for plan: ${planTier}` },
        { status: 500 }
      );
    }

    // Check if customer already exists for this account
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('account_id', profile.account_id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          accountId: profile.account_id,
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceIdMonthly,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/settings?billing=canceled`,
      subscription_data: {
        metadata: {
          accountId: profile.account_id,
          planTier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
