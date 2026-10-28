export interface DemoProduct {
  id: string;
  account_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  sku: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'demo-prod-001',
    title: 'WACRM Starter Plan',
    sku: 'WACRM-001',
    category: 'Software Subscription',
    price: 999,
    currency: 'INR',
    description: 'WhatsApp shared inbox, contact management, and basic automation.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-002',
    title: 'WACRM Business Plan',
    sku: 'WACRM-002',
    category: 'Software Subscription',
    price: 2499,
    currency: 'INR',
    description: 'Team inbox, sales pipeline, AI agent automations, and custom reporting.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-003',
    title: 'WACRM Enterprise Plan',
    sku: 'WACRM-003',
    category: 'Software Subscription',
    price: 9999,
    currency: 'INR',
    description: 'Advanced team management, multi-location inventory, and 4-eyes governance.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-004',
    title: 'CRM Setup & Onboarding Workshop',
    sku: 'SRV-001',
    category: 'Professional Services',
    price: 4999,
    currency: 'INR',
    description: 'Initial CRM configuration, team training, and workflow customization.',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-005',
    title: 'WhatsApp Automation Setup & Templates',
    sku: 'SRV-002',
    category: 'Professional Services',
    price: 2999,
    currency: 'INR',
    description: 'Automated 24/7 replies, lead capture flows, and payment link templates.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-006',
    title: 'Wireless QR & Barcode Scanner',
    sku: 'HW-001',
    category: 'Electronics',
    price: 2499,
    currency: 'INR',
    description: 'High-speed 2.4G wireless barcode scanner for retail checkout and warehouse dispatch.',
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-007',
    title: 'Executive Business Notebooks (Pack of 5)',
    sku: 'OFF-001',
    category: 'Office Supplies',
    price: 499,
    currency: 'INR',
    description: 'Hardcover professional journals for client meetings and sales tracking.',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'demo-prod-008',
    title: 'Omnichannel ERP Integration Pack',
    sku: 'SRV-003',
    category: 'Professional Services',
    price: 14999,
    currency: 'INR',
    description: 'Seamless two-way sync for Tally, Zoho, SAP, and custom ERP systems.',
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// In-memory catalog store per account (for instant testing & sandbox fallback)
const globalStore: Map<string, DemoProduct[]> = new Map();

export function getDemoProducts(accountId: string): DemoProduct[] {
  let list = globalStore.get(accountId);
  if (!list) {
    const now = new Date().toISOString();
    list = INITIAL_DEMO_PRODUCTS.map((p) => ({
      ...p,
      account_id: accountId,
      created_at: now,
      updated_at: now,
    }));
    globalStore.set(accountId, list);
  }
  return list;
}

export function addDemoProduct(accountId: string, product: Omit<DemoProduct, 'id' | 'account_id' | 'created_at' | 'updated_at'>): DemoProduct {
  const list = getDemoProducts(accountId);
  const now = new Date().toISOString();
  const created: DemoProduct = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    account_id: accountId,
    created_at: now,
    updated_at: now,
  };
  list.unshift(created);
  return created;
}

export function updateDemoProduct(accountId: string, id: string, updates: Partial<DemoProduct>): DemoProduct | null {
  const list = getDemoProducts(accountId);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return list[idx];
}

export function deleteDemoProduct(accountId: string, id: string): boolean {
  const list = getDemoProducts(accountId);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}

export function resetDemoProducts(accountId: string): DemoProduct[] {
  const now = new Date().toISOString();
  const list = INITIAL_DEMO_PRODUCTS.map((p) => ({
    ...p,
    account_id: accountId,
    created_at: now,
    updated_at: now,
  }));
  globalStore.set(accountId, list);
  return list;
}
