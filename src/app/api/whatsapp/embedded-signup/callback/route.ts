import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/whatsapp/encryption';
import {
  subscribeWabaToApp,
  verifyPhoneNumber,
} from '@/lib/whatsapp/meta-api';

const META_API_VERSION = 'v21.0';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
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
        { error: 'No account found for user' },
        { status: 400 }
      );
    }

    if (profile.account_role !== 'owner' && profile.account_role !== 'admin') {
      return NextResponse.json(
        { error: 'Only workspace owners or admins can connect WhatsApp' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, wabaId, phoneNumberId } = body;

    if (!code || !phoneNumberId || !wabaId) {
      return NextResponse.json(
        { error: 'Missing code, wabaId, or phoneNumberId from Meta' },
        { status: 400 }
      );
    }

    const appId =
      process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        {
          error:
            'Meta App credentials (META_APP_ID / META_APP_SECRET) not set in environment.',
        },
        { status: 500 }
      );
    }

    // 1. Exchange temporary authorization code for system user / access token
    const tokenUrl = new URL(
      `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`
    );
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString(), { method: 'GET' });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Failed to exchange Meta code for token:', tokenData);
      return NextResponse.json(
        {
          error:
            tokenData?.error?.message ||
            'Failed to exchange authorization code with Meta.',
        },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Verify the phone number with Meta
    const phoneInfo = await verifyPhoneNumber({
      phoneNumberId,
      accessToken,
    });

    // 3. Subscribe our app to WABA webhooks so incoming messages reach us
    try {
      await subscribeWabaToApp({ wabaId, accessToken });
    } catch (subErr) {
      console.warn('Webhook auto-subscription warning:', subErr);
    }

    // 4. Save encrypted config to database
    const encryptedToken = encrypt(accessToken);
    const admin = getAdminClient();

    const { error: upsertErr } = await admin.from('whatsapp_config').upsert(
      {
        account_id: profile.account_id,
        user_id: user.id,
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        access_token: encryptedToken,
        status: 'connected',
        connected_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        subscribed_apps_at: new Date().toISOString(),
        last_registration_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id' }
    );

    if (upsertErr) {
      console.error('Failed to save whatsapp_config:', upsertErr);
      return NextResponse.json(
        { error: 'Failed to save WhatsApp configuration to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      phone_info: phoneInfo,
    });
  } catch (error) {
    console.error('Embedded signup callback error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
