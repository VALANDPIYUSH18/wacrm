'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">WACRM</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Meta Cloud API
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-muted-foreground">
          <a href="#why" className="transition hover:text-foreground">Why WACRM</a>
          <a href="#verticals" className="transition hover:text-foreground">Target Industries</a>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#comparison" className="transition hover:text-foreground">Vs Competitors</a>
          <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-sm')}
          >
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
