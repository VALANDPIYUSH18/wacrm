import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Privacy Policy | WACRM',
  description: 'How WACRM protects and processes customer conversation data in compliance with the Digital Personal Data Protection (DPDP) Act 2023 and Meta Cloud API standards.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">WA</span>
            <span className="font-bold text-foreground">WACRM Privacy</span>
          </div>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Client Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 border border-emerald-500/20">
            <Shield className="h-3.5 w-3.5" /> DPDP Act 2023 & Meta Cloud API Compliant
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: October 29, 2026 • Effective Date: October 29, 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> 1. Overview & Commitment
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WACRM (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a multi-tenant WhatsApp CRM and sales automation platform designed for businesses to manage customer conversations, sales pipelines, in-chat commerce, and customer service. We are committed to safeguarding personal data and respecting your privacy in strict compliance with the Indian Digital Personal Data Protection (DPDP) Act 2023, the Information Technology Act 2000, and Meta WhatsApp Business Platform policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> 2. Data We Collect and Process
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <h3 className="font-semibold text-foreground text-sm">A. Account & Business Information</h3>
              <p className="mt-1 text-xs">Name, business email address, company name, industry, billing address, and authentication credentials necessary to provide workspace services.</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <h3 className="font-semibold text-foreground text-sm">B. WhatsApp Meta API Integration Data</h3>
              <p className="mt-1 text-xs">Meta WhatsApp Phone Number ID, WhatsApp Business Account (WABA) ID, and OAuth access tokens. Access tokens are encrypted at rest using AES-256-GCM encryption before storage.</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <h3 className="font-semibold text-foreground text-sm">C. End-Customer Conversation & Contact Data</h3>
              <p className="mt-1 text-xs">Phone numbers, customer contact profiles, incoming and outgoing chat messages, delivery status updates (sent, delivered, read), and customer-initiated media files.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> 3. Data Protection & Tenant Isolation
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We enforce strict multi-tenant isolation. Each business workspace operates with row-level security (RLS) keys ensuring that no business customer can ever view, query, or modify the contacts, messages, orders, or credentials of another workspace.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground mt-2">
            <li className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>AES-256-GCM encrypted Meta access tokens</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Strict PostgreSQL Row Level Security (RLS)</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Zero raw payment card storage (PCI-DSS compliant gateways)</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Cryptographic HMAC-SHA256 webhook verification</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Customer Consent & WhatsApp Messaging Rules</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As a business using WACRM, you are solely responsible for ensuring you have obtained explicit consent and opt-in from recipients before sending WhatsApp marketing or broadcast messages. If an end-user sends &quot;STOP&quot;, &quot;UNSUBSCRIBE&quot;, or &quot;CANCEL&quot;, WACRM supports automated opt-out tracking to immediately prevent further outbound broadcasts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Data Retention & Deletion Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Under the DPDP Act 2023, account owners may request export or deletion of their workspace data at any time. When a workspace is deleted, all associated message logs, contact records, catalog items, and credentials are permanently purged from active databases within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">6. Contact & Grievance Officer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For privacy inquiries, data subject access requests, or grievance redressal, please contact our designated Grievance Officer:
          </p>
          <div className="p-4 rounded-xl border border-border bg-card text-xs space-y-1 text-muted-foreground">
            <p><strong className="text-foreground">Grievance Officer:</strong> WACRM Compliance & Privacy Desk</p>
            <p><strong className="text-foreground">Email:</strong> privacy@wacrm-suwu.vercel.app</p>
            <p><strong className="text-foreground">Jurisdiction:</strong> Ahmedabad, Gujarat, India</p>
          </div>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} WACRM. All rights reserved.</p>
          <Link href="/terms" className="hover:text-foreground underline">View Terms of Service</Link>
        </div>
      </main>
    </div>
  );
}
