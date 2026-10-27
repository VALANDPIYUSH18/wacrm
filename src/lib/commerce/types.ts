export type PaymentGatewayProvider = 'razorpay' | 'stripe';

export type PaymentOrderStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface Product {
  id: string;
  account_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  sku: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayConfig {
  id: string;
  account_id: string;
  provider: PaymentGatewayProvider;
  is_active: boolean;
  encrypted_publishable_key: string | null;
  encrypted_secret_key: string;
  encrypted_webhook_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrder {
  id: string;
  account_id: string;
  conversation_id: string | null;
  contact_id: string | null;
  product_id: string | null;
  amount: number;
  currency: string;
  provider: PaymentGatewayProvider;
  provider_payment_link_id: string | null;
  payment_url: string;
  status: PaymentOrderStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentLinkParams {
  conversationId: string;
  contactId?: string;
  productId?: string;
  amount: number;
  currency: string;
  title: string;
  description?: string;
  provider: PaymentGatewayProvider;
}
