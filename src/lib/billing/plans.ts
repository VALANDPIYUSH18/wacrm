export type PlanTier = 'starter' | 'growth' | 'scale';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceIdMonthly: string | undefined;
  limits: {
    maxSeats: number;
    maxWhatsAppNumbers: number;
    maxMonthlyBroadcasts: number;
    hasAutomations: boolean;
    hasPipelines: boolean;
    hasAiReplies: boolean;
  };
}

export const SAAS_PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small shops getting started with WhatsApp CRM.',
    priceMonthly: 29,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER,
    limits: {
      maxSeats: 2,
      maxWhatsAppNumbers: 1,
      maxMonthlyBroadcasts: 1000,
      hasAutomations: false,
      hasPipelines: true,
      hasAiReplies: false,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'For growing businesses requiring automations and marketing.',
    priceMonthly: 79,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_GROWTH,
    limits: {
      maxSeats: 5,
      maxWhatsAppNumbers: 1,
      maxMonthlyBroadcasts: 10000,
      hasAutomations: true,
      hasPipelines: true,
      hasAiReplies: true,
    },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    description:
      'For larger teams with high volume and multiple phone numbers.',
    priceMonthly: 179,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_SCALE,
    limits: {
      maxSeats: 15,
      maxWhatsAppNumbers: 3,
      maxMonthlyBroadcasts: 50000,
      hasAutomations: true,
      hasPipelines: true,
      hasAiReplies: true,
    },
  },
};
