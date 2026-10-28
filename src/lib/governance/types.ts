export type ApprovalRequestType =
  | 'price_override'
  | 'refund'
  | 'contract_signature'
  | 'bulk_broadcast'
  | 'catalog_price_change';

export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  account_id: string;
  request_type: ApprovalRequestType;
  status: ApprovalRequestStatus;
  requested_by: string;
  reviewed_by: string | null;
  entity_type: string;
  entity_id: string;
  requested_payload: Record<string, unknown>;
  rejection_reason: string | null;
  approval_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  requester?: {
    full_name: string | null;
    email: string | null;
  } | null;
  reviewer?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface InventoryItem {
  id: string;
  account_id: string;
  product_id: string;
  location_name: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_threshold: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    title: string;
    sku: string | null;
    price: number;
    currency: string;
  } | null;
}

export type OrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export interface Order {
  id: string;
  account_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  account_id: string;
  product_id: string | null;
  title: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  account_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
