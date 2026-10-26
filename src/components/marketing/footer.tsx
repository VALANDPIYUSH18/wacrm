import Link from 'next/link';
import { MessageSquare, Shield, Lock, Zap } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card/50 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">WACRM</span>
            </div>
            <p className="text-sm">
              The modern WhatsApp CRM and automation engine for high-growth businesses. Eliminate lead leakage and close deals 3x faster.
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-primary" /> Meta Verified</span>
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> AES-256</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#features" className="hover:text-foreground">Shared Team Inbox</a></li>
              <li><a href="#features" className="hover:text-foreground">Visual Flow Builder</a></li>
              <li><a href="#features" className="hover:text-foreground">Sales Pipelines</a></li>
              <li><a href="#features" className="hover:text-foreground">Broadcast Campaigns</a></li>
              <li><Link href="/admin" className="hover:text-foreground">Agency Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Target Industries</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#verticals" className="hover:text-foreground">E-Commerce & D2C</a></li>
              <li><a href="#verticals" className="hover:text-foreground">Real Estate & Developers</a></li>
              <li><a href="#verticals" className="hover:text-foreground">Healthcare & Dental Clinics</a></li>
              <li><a href="#verticals" className="hover:text-foreground">Automobile Dealerships</a></li>
              <li><a href="#verticals" className="hover:text-foreground">B2B Wholesale & ERP</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Get Started</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-foreground">14-Day Free Trial</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Sign In to Dashboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Client Workspace</Link></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing Plans</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} WACRM. All rights reserved. Powered by official Meta WhatsApp Cloud API.</p>
        </div>
      </div>
    </footer>
  );
}
