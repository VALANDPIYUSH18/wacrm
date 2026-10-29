import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Terms of Service | WACRM',
  description: 'Terms and conditions for using WACRM WhatsApp CRM and sales automation SaaS platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">WA</span>
            <span className="font-bold text-foreground">WACRM Terms</span>
          </div>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
            <FileText className="h-3.5 w-3.5" /> Customer Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: October 29, 2026 • Effective Date: October 29, 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By creating an account, connecting a WhatsApp Business phone number, or using WACRM, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. Permitted Use & Meta WhatsApp Policies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WACRM operates exclusively via the official Meta WhatsApp Business Cloud API. You agree to adhere strictly to:
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Meta WhatsApp Business Messaging Policy and WhatsApp Commerce Policy.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Obtaining documented opt-in consent before initiating marketing or promotional broadcasts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Zero tolerance for unsolicited spam, harassment, hate speech, unauthorized financial schemes, or predatory marketing.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">3. Subscriptions, Fees & Billing</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>SaaS Platform Subscription:</strong> Monthly or annual subscription fees are billed in advance according to your selected plan (Starter, Growth, or Scale).
            </p>
            <p>
              <strong>Meta Conversation Charges:</strong> Meta charges per-conversation fees directly to your Meta Business Account according to regional pricing tiers (Business-Initiated Marketing, Utility, Authentication, or Service conversations). WACRM adds zero per-message markup.
            </p>
            <p>
              <strong>Cancellation & Refunds:</strong> You may cancel your subscription at any time via your account settings. Subscriptions remain active until the end of the current billing cycle.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Account Responsibility & Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are responsible for safeguarding your login credentials, API keys, and access permissions. You are solely responsible for actions performed by team members you invite to your workspace.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WACRM shall not be held liable for any suspension, quality rating drop, or ban imposed by Meta on your WhatsApp number resulting from user reports, spam broadcasts, or policy violations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">6. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts of Ahmedabad, Gujarat, India.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} WACRM. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-foreground underline">View Privacy Policy</Link>
        </div>
      </main>
    </div>
  );
}
