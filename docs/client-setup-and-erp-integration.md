# Client Setup, ERP Integration & Implementation Playbook

This document is the master operational and technical guide for deploying, configuring, and integrating **WACRM** for clients across any industry.

---

## 1. Quick Client Setup Guide (0 to Live in 15 Minutes)

### Step 1: Workspace Account Creation
1. Direct the client to `https://<your-domain>/signup`.
2. The user registers with company email and creates their Workspace / Account.
3. The creator is automatically designated as workspace `Owner`.

### Step 2: Connect WhatsApp (2-Click Meta Embedded Signup)
1. Navigate to **Settings** (`/settings`) → **WhatsApp**.
2. Click **"Connect WhatsApp in 2 Clicks"** (Quick Connect with Meta).
3. Log in with the client's Facebook/Meta Business Manager account.
4. Select or create the WhatsApp Business Account (WABA) and phone number.
5. The system automatically:
   - Exchanges secure OAuth tokens.
   - Verifies phone ownership.
   - Registers Meta Webhooks for real-time bi-directional messaging.
   - Encrypts and securely stores credentials via AES-256-GCM.

### Step 3: Invite Team Members & Assign Roles
1. Navigate to **Settings** → **Members**.
2. Invite agents and managers with role-based permissions:
   - **Owner / Admin**: Full workspace, billing, API keys, and WhatsApp settings.
   - **Manager**: Manage broadcasts, flows, automations, and view reporting.
   - **Agent**: Shared inbox chat, contact management, notes, tags, pipeline stage moves.
   - **Viewer**: Read-only oversight.

### Step 4: Choose a Subscription Plan
1. Navigate to **Settings** → **Plans & billing**.
2. Choose a tier based on client volume:
   - **Starter ($29/mo)**: 2 seats, 1,000 broadcasts/mo, shared inbox, CRM pipelines.
   - **Growth ($79/mo)**: 5 seats, 10,000 broadcasts/mo, visual flow builder, automations, AI auto-replies.
   - **Scale ($179/mo)**: 15 seats, 50,000 broadcasts/mo, 3 phone numbers, priority webhook delivery.

---

## 2. Connecting WACRM with Any ERP or External Software

WACRM connects with any ERP (SAP, Oracle NetSuite, Microsoft Dynamics 365, Odoo, Zoho Books, TallyPrime, QuickBooks, Salesforce, HubSpot, or custom proprietary databases) using two methods:

### Method A: Outbound Real-time Ingestion via Public REST API (`/api/v1`)

Clients create an API key in **Settings → API keys → New API key** with scopes:
- `messages:send`
- `contacts:write`
- `contacts:read`
- `conversations:read`

#### 1. ERP Order Confirmation / Invoice Notification
When an order or invoice is generated in the ERP, the ERP issues an HTTP POST:
```bash
POST https://<your-domain>/api/v1/messages
Authorization: Bearer wacrm_live_xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "to": "+15551234567",
  "template": {
    "name": "order_confirmation_v1",
    "language": "en_US",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Acme Corp" },
          { "type": "text", "text": "INV-98234" },
          { "type": "text", "text": "$4,250.00" }
        ]
      }
    ]
  }
}
```

#### 2. Automatic Contact & Lead Sync from ERP / CRM
Sync customer master records from ERP to WACRM:
```bash
POST https://<your-domain>/api/v1/contacts
Authorization: Bearer wacrm_live_xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+15559876543",
  "email": "jane@acmecorp.com",
  "tags": ["vip", "enterprise", "tally-synced"],
  "custom_fields": {
    "erp_customer_code": "CUST-00941",
    "credit_limit": 50000,
    "payment_terms": "Net 30"
  }
}
```

---

### Method B: Inbound Event Webhooks (WACRM → ERP)

Whenever a client responds on WhatsApp, clicks a button, or changes a pipeline deal stage, WACRM fires an outbound HTTPS webhook to the client's ERP endpoint.

1. Navigate to **Settings → Webhooks → Add Endpoint**.
2. Subscribe to events:
   - `message.received`: A customer replied or sent an inquiry.
   - `message.delivered` / `message.read`: Proof of message delivery.
   - `contact.stage_changed`: Deal advanced in sales pipeline.
   - `flow.completed`: Customer answered a qualifying flow survey.

#### Sample Webhook Payload Received by ERP:
```json
{
  "event": "message.received",
  "account_id": "acct_84920481",
  "timestamp": "2026-10-26T12:00:00Z",
  "data": {
    "contact": {
      "id": "c_123",
      "phone": "+15559876543",
      "name": "Jane Doe"
    },
    "message": {
      "id": "wamid.HBgL...",
      "text": "Please send quotation for 500 units of Model X",
      "type": "text"
    }
  }
}
```

---

### Method C: No-Code / Low-Code Middleware (Zapier, Make, n8n, Flowise)
For clients using tools without custom code:
1. Use the **WACRM Webhook trigger** in Make / Zapier.
2. Connect to standard ERP connectors (Odoo, Zoho, QuickBooks, Google Sheets).
3. Map inbound leads or trigger automated quotes instantly.

---

## 3. Client Implementation Plan: Adapting Business Processes

To ensure rapid user adoption and minimal friction:

| Step | Business Process | WACRM Feature to Configure | Outcome |
| :--- | :--- | :--- | :--- |
| **Phase 1: Inbound Lead Capture** | Web visitors, ads, WhatsApp QR codes | Auto-reply AI bot + Inbound Flow | 100% response rate in < 5 seconds |
| **Phase 2: Sales Qualification** | SDRs & Sales Reps qualifying leads | Kanban Pipelines + Custom Tags | Clear visibility on deal stages |
| **Phase 3: Order Processing** | Operations & Finance updating orders | ERP Webhook / Public API sync | Automatic WhatsApp dispatch on dispatch/delivery |
| **Phase 4: Customer Support** | Support desk resolving queries | Shared Team Inbox + Routing rules | Tickets resolved with multi-agent assignment |
| **Phase 5: Re-engagement & Marketing** | Promotional updates & festive offers | Broadcast Campaigns + Segmentation | 98% open rates vs 15% on email |

---

## 4. Making the CRM Effortlessly Usable for Non-Technical Staff

1. **Shared Team Inbox (`/inbox`)**:
   - Single unified interface where all agents see customer chats.
   - Internal team notes (`@agent can you review this quote?`) that customers never see.
   - Pre-canned quick replies (`/pricing`, `/hours`, `/bankdetails`).
2. **Visual Drag-and-Drop Flow Builder (`/flows`)**:
   - Zero coding required: connect blocks for Questions, Menus, Conditional logic, and Tagging.
3. **Automated AI Assistant (`/settings → AI Agent`)**:
   - Upload business PDFs, FAQs, or catalog text.
   - The AI drafts answers or auto-replies directly to customer questions 24/7.
4. **Pre-built Templates (`/settings → Templates`)**:
   - WhatsApp Meta-approved templates with 1-click submission.
   - Dynamic variables (`{{1}}` for customer name, `{{2}}` for order ID).
