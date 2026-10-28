import type { SupabaseClient } from '@supabase/supabase-js';
import { SAAS_PLANS, type PlanTier } from '@/lib/billing/plans';

export interface AccountEntitlements {
  planTier: PlanTier;
  status: string;
  isTrialExpired: boolean;
  maxSeats: number;
  currentSeats: number;
  canInviteSeat: boolean;
  maxMonthlyBroadcasts: number;
  currentMonthlyBroadcasts: number;
  canSendBroadcast: boolean;
  hasAutomations: boolean;
  hasAiReplies: boolean;
}

/**
 * Get subscription and entitlement status for an account.
 * Defaults to 'starter' plan in trial mode if no subscription row exists yet.
 */
export async function getAccountEntitlements(
  supabase: SupabaseClient,
  accountId: string
): Promise<AccountEntitlements> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_tier, status, current_period_end')
    .eq('account_id', accountId)
    .maybeSingle();

  const planTier = (sub?.plan_tier as PlanTier) || 'starter';
  const plan = SAAS_PLANS[planTier] || SAAS_PLANS.starter;
  const status = sub?.status || 'trialing';

  // Check if trial is expired
  let isTrialExpired = false;
  if (status === 'trialing' && sub?.current_period_end) {
    isTrialExpired = new Date(sub.current_period_end).getTime() < Date.now();
  }

  // Count current accepted seats (profiles linked to this account)
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId);

  // Count active pending invitations that also reserve a seat
  const { count: inviteCount } = await supabase
    .from('account_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString());

  const currentSeats = (memberCount || 0) + (inviteCount || 0);
  const maxSeats = plan.limits.maxSeats;
  const canInviteSeat = !isTrialExpired && currentSeats < maxSeats;

  // Count broadcasts sent in current 30-day window
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: broadcastCount } = await supabase
    .from('broadcasts')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .gte('created_at', startOfMonth.toISOString());

  const currentMonthlyBroadcasts = broadcastCount || 0;
  const maxMonthlyBroadcasts = plan.limits.maxMonthlyBroadcasts;
  const canSendBroadcast =
    !isTrialExpired && currentMonthlyBroadcasts < maxMonthlyBroadcasts;

  return {
    planTier,
    status,
    isTrialExpired,
    maxSeats,
    currentSeats,
    canInviteSeat,
    maxMonthlyBroadcasts,
    currentMonthlyBroadcasts,
    canSendBroadcast,
    hasAutomations: plan.limits.hasAutomations,
    hasAiReplies: plan.limits.hasAiReplies,
  };
}
