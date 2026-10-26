import Link from 'next/link';
import {
  MessageSquare,
  Zap,
  Users,
  GitBranch,
  Radio,
  Workflow,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Home,
  Stethoscope,
  Car,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'WACRM — The Modern WhatsApp CRM & Automation Engine for Business',
  description:
    'Turn WhatsApp into your #1 revenue channel with shared team inbox, visual flow builder, sales pipelines, and ERP sync. 0% per-seat penalties.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen WhatsApp Business Growth Platform</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Turn WhatsApp into Your Company&apos;s{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-primary bg-clip-text text-transparent">
              #1 Revenue Engine
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Stop losing leads on personal phones. Empower your entire team with a unified shared inbox,
            drag-and-drop conversational bots, visual Kanban deal pipelines, and ERP sync.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base shadow-md gap-2')}
            >
              Start 14-Day Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-8 text-base')}
            >
              Explore Live Dashboard
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border/60 pt-8 sm:grid-cols-4 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Average Open Rate vs 18% Email</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">&lt; 5s</div>
              <div className="text-xs text-muted-foreground mt-0.5">Automated Lead Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">3x</div>
              <div className="text-xs text-muted-foreground mt-0.5">Higher Sales Conversion Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">0%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Per-Seat Markup Penalties</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY WACRM (THE CORE PROBLEM VS SOLUTION) */}
      <section id="why" className="py-20 border-b border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">The Reality Check</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Traditional WhatsApp Sales Is Costing You Revenue
            </h3>
            <p className="mt-4 text-muted-foreground">
              Most businesses still run their high-ticket sales through individual sales reps&apos; personal phones, leading to catastrophic customer churn.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* The Old Way */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <XCircle className="h-5 w-5" />
                  <span>The Painful Old Way (Personal WhatsApp Numbers)</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Lead Leakage & Data Loss:</strong> Reps leave the company and take their entire client database with them on their personal phone.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Slow 2-Hour Response Times:</strong> Leads go completely cold before sales agents reply, handing customers to competitors.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Zero Management Visibility:</strong> Managers have no way to audit chat quality, verify quotes, or track deal stages.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Risk of Account Bans:</strong> Using personal or unverified WhatsApp accounts triggers instant permanent Meta bans.</p>
                </div>
              </CardContent>
            </Card>

            {/* The WACRM Way */}
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>The WACRM Advantage (Verified Enterprise Cloud API)</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Centralized Verified Brand Number:</strong> Your whole company operates from 1 green-tick official WhatsApp number with full company data ownership.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Sub-5-Second Instant Qualification:</strong> Visual flows and AI bots qualify leads, answer FAQs, and book demos 24/7.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Visual Kanban Sales Pipelines:</strong> Track deals with real dollar values from discovery to invoice settlement.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p><strong className="text-foreground">Shared Team Inbox with Notes:</strong> Multi-agent routing, private internal team @notes, and 1-click canned responses.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. TARGET VERTICALS */}
      <section id="verticals" className="py-20 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Tailored Industry Solutions</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Engineered for High-Conversion Business Sectors
            </h3>
            <p className="mt-4 text-muted-foreground">
              Whether you are recovering e-commerce cart drop-offs or qualifying luxury real estate buyers, WACRM adapts to your workflow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. E-Commerce */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">E-Commerce & D2C Brands</CardTitle>
                <CardDescription>Recover 25–45% of lost revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Automated abandoned cart recovery sequences with instant checkout links.</p>
                <p>• Cash-on-Delivery (COD) automated confirmation buttons to eliminate RTO losses.</p>
                <p>• Live shipping and tracking updates delivered directly on WhatsApp.</p>
              </CardContent>
            </Card>

            {/* 2. Real Estate */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Home className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Real Estate & Developers</CardTitle>
                <CardDescription>Instant brochure delivery & zero lead loss</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Instant floorplan and video brochure dispatch when an ad lead comes in.</p>
                <p>• Automated calendar booking for site visits and physical tours.</p>
                <p>• Multi-agent assignment so no high-ticket property buyer waits in queue.</p>
              </CardContent>
            </Card>

            {/* 3. Healthcare & Clinics */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Healthcare & Dental Clinics</CardTitle>
                <CardDescription>Eliminate missed appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Automated 2-way appointment reminders with Confirm/Reschedule buttons.</p>
                <p>• Pre-op and post-procedure medical instruction delivery.</p>
                <p>• Secure prescription and lab report sharing.</p>
              </CardContent>
            </Card>

            {/* 4. Automobile Dealerships */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Car className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Automobile Dealerships</CardTitle>
                <CardDescription>Test drives and service reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Instant model spec sheets, price quotations, and test-drive scheduling.</p>
                <p>• Automated periodic car service and insurance renewal reminders.</p>
                <p>• WhatsApp quotation dispatch from your service desk.</p>
              </CardContent>
            </Card>

            {/* 5. B2B Wholesale */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Briefcase className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">B2B Wholesale & ERP</CardTitle>
                <CardDescription>Instant quotes and payment follow-ups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Direct ERP sync with Tally, SAP, Zoho Books, and Salesforce.</p>
                <p>• Automated dispatch of PDF invoices and overdue payment alerts.</p>
                <p>• Interactive product catalog browsing directly inside WhatsApp.</p>
              </CardContent>
            </Card>

            {/* 6. Education */}
            <Card className="hover:border-primary/40 transition">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Education & Consultancies</CardTitle>
                <CardDescription>Boost student admission conversions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Instant syllabus PDF dispatch and automated counselor assignment.</p>
                <p>• Webinar attendance reminders that get 80%+ show-up rates.</p>
                <p>• Application fee reminders and document collection via chat.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES */}
      <section id="features" className="py-20 border-b border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Full-Stack Platform</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything Needed to Scale Customer Conversations
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">Multi-Agent Shared Inbox</h4>
              <p className="text-sm text-muted-foreground">
                One number, unlimited team members. Assign chats, add private internal team notes, use canned quick-replies, and filter by tags.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Workflow className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">Visual Flow Builder</h4>
              <p className="text-sm text-muted-foreground">
                Drag-and-drop mind-map canvas powered by React Flow. Create interactive button menus, qualify leads, and hand off to human reps seamlessly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GitBranch className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">Sales Pipelines & Kanban</h4>
              <p className="text-sm text-muted-foreground">
                Visually track prospects from initial inquiry to payment. Attach monetary deal values and drag leads through custom stages.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Radio className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">Targeted Broadcast Campaigns</h4>
              <p className="text-sm text-muted-foreground">
                Send bulk WhatsApp campaigns to segmented audiences with Meta-approved templates, rich media, and 98% open rates.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">Multi-Tenant Admin Panel</h4>
              <p className="text-sm text-muted-foreground">
                Supervise multiple client organizations, monitor WhatsApp phone connection health, and track client subscription statuses in one spot.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold">ERP & Webhook Integrations</h4>
              <p className="text-sm text-muted-foreground">
                Full REST API (/api/v1) and outbound webhooks to sync leads and orders with SAP, Tally, Zoho, Zapier, Make, and custom databases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPETITOR COMPARISON */}
      <section id="comparison" className="py-20 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Why Switch</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              WACRM vs. Legacy WhatsApp Software
            </h3>
            <p className="mt-4 text-muted-foreground">
              See why modern enterprises and agencies are migrating from expensive closed tools like Wati and Respond.io.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-border rounded-xl overflow-hidden">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">Capability</th>
                  <th className="p-4 text-primary font-bold">WACRM</th>
                  <th className="p-4">Wati</th>
                  <th className="p-4">Respond.io</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 font-medium text-foreground">Data Ownership & Privacy</td>
                  <td className="p-4 text-emerald-500 font-semibold">100% Yours (Self-Host or SaaS)</td>
                  <td className="p-4 text-muted-foreground">Closed SaaS Cloud</td>
                  <td className="p-4 text-muted-foreground">Closed SaaS Cloud</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Per-Agent Seat Penalties</td>
                  <td className="p-4 text-emerald-500 font-semibold">$0 per-agent fees</td>
                  <td className="p-4 text-muted-foreground">Expensive add-ons per seat</td>
                  <td className="p-4 text-muted-foreground">High cost per user</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Visual Kanban Sales Pipeline</td>
                  <td className="p-4 text-emerald-500 font-semibold">Built-in with Deal Values</td>
                  <td className="p-4 text-muted-foreground">Not Native (Chat only)</td>
                  <td className="p-4 text-muted-foreground">Limited Stages</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Multi-Tenant Agency Admin</td>
                  <td className="p-4 text-emerald-500 font-semibold">Included (/admin console)</td>
                  <td className="p-4 text-muted-foreground">Custom Enterprise Only</td>
                  <td className="p-4 text-muted-foreground">Enterprise Only</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-foreground">Modern Tech Stack</td>
                  <td className="p-4 text-emerald-500 font-semibold">Next.js 16 + Supabase Postgres</td>
                  <td className="p-4 text-muted-foreground">Legacy Monolith</td>
                  <td className="p-4 text-muted-foreground">Proprietary Cloud</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section id="pricing" className="py-20 border-b border-border/40 bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Transparent Pricing</h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Predictable Plans for Every Scale
            </h3>
            <p className="mt-4 text-muted-foreground">
              Every plan includes official Meta Cloud API connectivity, unlimited contacts, and zero hidden markups.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <CardDescription>For boutique teams and early startups</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">$29</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 2 Team Agent Seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Shared Multi-Agent Inbox</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Visual Kanban Sales Pipeline</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 1,000 Broadcasts / month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 1 Verified WhatsApp Number</li>
                </ul>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full mt-6')}
                >
                  Get Started
                </Link>
              </CardContent>
            </Card>

            {/* Growth */}
            <div className="relative pt-3 lg:-mt-3">
              <Card className="border-2 border-primary shadow-xl overflow-visible bg-card relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-md ring-2 ring-background">
                    <Sparkles className="h-3.5 w-3.5" /> Most Popular
                  </span>
                </div>
                <CardHeader className="pt-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Growth</CardTitle>
                    <Badge variant="secondary" className="text-xs text-primary bg-primary/10">Recommended</Badge>
                  </div>
                  <CardDescription>For growing businesses and sales teams</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-foreground">$79</span>
                    <span className="text-muted-foreground"> / month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="font-medium text-foreground">5 Team Agent Seats</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Drag-and-Drop Flow Builder</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 10,000 Broadcasts / month</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> REST API & Webhooks (/api/v1)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Automated AI Lead Qualification</li>
                  </ul>
                  <Link
                    href="/signup"
                    className={cn(buttonVariants({ size: 'lg' }), 'w-full mt-6 shadow-md')}
                  >
                    Start Free Trial
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Scale */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Scale</CardTitle>
                <CardDescription>For high-volume operations & enterprises</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">$179</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 15 Team Agent Seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Up to 3 Phone Numbers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 50,000 Broadcasts / month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Custom ERP & Webhook Ingestion</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Priority WhatsApp Delivery</li>
                </ul>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full mt-6')}
                >
                  Contact Sales
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-20 bg-gradient-to-t from-primary/10 via-background to-background text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Ready to Accelerate Your WhatsApp Conversions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Launch your workspace in under 15 minutes with 2-click Meta Embedded Signup. No credit card required.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base gap-2 shadow-md')}
            >
              Claim 14-Day Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-8 text-base')}
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
