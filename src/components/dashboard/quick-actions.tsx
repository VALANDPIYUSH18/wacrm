"use client"

import Link from 'next/link'
import { UserPlus, Briefcase, Radio, Zap, ShoppingBag, MessageSquare } from 'lucide-react'
import type { ComponentType } from 'react'

interface Action {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  tint: string
  badge?: string
}

const ACTIONS: Action[] = [
  { label: 'Live Inbox', href: '/chat', icon: MessageSquare, tint: 'text-emerald-500', badge: 'Active' },
  { label: 'New Deal', href: '/pipelines', icon: Briefcase, tint: 'text-blue-400' },
  { label: 'New Contact', href: '/contacts', icon: UserPlus, tint: 'text-primary' },
  { label: 'New Broadcast', href: '/broadcasts/new', icon: Radio, tint: 'text-amber-400' },
  { label: 'Products & Pay', href: '/products', icon: ShoppingBag, tint: 'text-indigo-400' },
  { label: 'New Flow / Bot', href: '/automations/new', icon: Zap, tint: 'text-violet-400' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {ACTIONS.map((a) => {
        const Icon = a.icon
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-muted/60"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${a.tint}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {a.label}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
