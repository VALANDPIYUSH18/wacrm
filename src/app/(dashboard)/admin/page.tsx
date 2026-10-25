'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Users,
  MessageSquare,
  CreditCard,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientItem {
  id: string;
  name: string;
  created_at: string;
  owner_user_id: string;
  member_count: number;
  whatsapp_connected: boolean;
  phone_number_id: string | null;
  plan_tier: string;
  subscription_status: string;
  current_period_end: string | null;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch clients');
      }
      setClients(data.clients || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error fetching clients'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = clients.length;
  const connectedWhatsApp = clients.filter((c) => c.whatsapp_connected).length;
  const activeSubs = clients.filter(
    (c) =>
      c.subscription_status === 'active' || c.subscription_status === 'trialing'
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Building2 className="text-primary h-6 w-6" />
            Client Workspaces & Multi-Tenant Admin
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage all onboarded client accounts, WhatsApp connectivity, plans,
            and team sizes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClients}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workspaces
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Active client organizations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              WhatsApp Connected
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-[#25D366]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedWhatsApp}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Live numbers sending & receiving
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubs}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Paying or active trial clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
        <Input
          placeholder="Search by client workspace name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card pl-9"
        />
      </div>

      {/* Client List Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Clients</CardTitle>
          <CardDescription>
            Overview of every client account on your WACRM installation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-y text-xs font-medium uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Workspace</th>
                  <th className="px-4 py-3 text-left">Plan Tier</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-center">Team Members</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Loading clients...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No client accounts found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">
                            {client.name}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {client.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="font-medium capitalize"
                        >
                          {client.plan_tier}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            client.subscription_status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs capitalize"
                        >
                          {client.subscription_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {client.whatsapp_connected ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                            Connected
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Not connected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Users className="h-3.5 w-3.5" />
                          <span>{client.member_count}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-right text-xs">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
