import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { decrypt, encrypt } from '@/lib/whatsapp/encryption';
import type { PaymentGatewayProvider } from './types';

let _adminClient: SupabaseClient | null = null;
function getAdmin(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export interface DecryptedGatewayConfig {
  provider: PaymentGatewayProvider;
  isActive: boolean;
  publishableKey: string | null;
  secretKey: string;
  webhookSecret: string | null;
}

export async function getGatewayConfig(
  accountId: string,
  provider: PaymentGatewayProvider
): Promise<DecryptedGatewayConfig | null> {
  const admin = getAdmin();
  const { data, error } = await admin
    .from('payment_gateway_configs')
    .select('*')
    .eq('account_id', accountId)
    .eq('provider', provider)
    .maybeSingle();

  if (error || !data) return null;

  try {
    const secretKey = decrypt(data.encrypted_secret_key);
    const publishableKey = data.encrypted_publishable_key
      ? decrypt(data.encrypted_publishable_key)
      : null;
    const webhookSecret = data.encrypted_webhook_secret
      ? decrypt(data.encrypted_webhook_secret)
      : null;

    return {
      provider: data.provider,
      isActive: Boolean(data.is_active),
      publishableKey,
      secretKey,
      webhookSecret,
    };
  } catch (err) {
    console.error(`Failed to decrypt gateway keys for ${provider}:`, err);
    return null;
  }
}

export async function saveGatewayConfig(
  accountId: string,
  provider: PaymentGatewayProvider,
  payload: {
    isActive?: boolean;
    publishableKey?: string | null;
    secretKey?: string;
    webhookSecret?: string | null;
  }
): Promise<void> {
  const admin = getAdmin();
  const updates: Record<string, string | number | boolean | null> = {
    account_id: accountId,
    provider,
    updated_at: new Date().toISOString(),
  };

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
  }
  if (payload.publishableKey !== undefined) {
    updates.encrypted_publishable_key = payload.publishableKey
      ? encrypt(payload.publishableKey)
      : null;
  }
  if (payload.secretKey) {
    updates.encrypted_secret_key = encrypt(payload.secretKey);
  }
  if (payload.webhookSecret !== undefined) {
    updates.encrypted_webhook_secret = payload.webhookSecret
      ? encrypt(payload.webhookSecret)
      : null;
  }

  const { error } = await admin.from('payment_gateway_configs').upsert(updates, {
    onConflict: 'account_id,provider',
  });

  if (error) {
    throw new Error(`Failed to save payment config: ${error.message}`);
  }
}
