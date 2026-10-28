'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  ArrowRight,
  Loader2,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ApprovalRequest } from '@/lib/governance/types';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = useCallback(async () => {
    try {
      const url = statusFilter === 'all'
        ? '/api/approvals'
        : `/api/approvals?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch approval requests');
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error loading requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchApprovals();
  }, [fetchApprovals]);

  const handleReview = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/approvals/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          notes,
          rejectionReason: actionType === 'rejected' ? notes : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${actionType} request`);

      toast.success(
        actionType === 'approved'
          ? 'Approval granted successfully'
          : 'Request rejected'
      );
      setSelectedRequest(null);
      setNotes('');
      void fetchApprovals();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Review action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" /> Pending Review
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_override':
        return <DollarSign className="h-4 w-4 text-primary" />;
      case 'catalog_price_change':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'refund':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Manager Approvals & 4-Eyes Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enforce separation of duties for price overrides, refunds, and contracts. Agents submit; managers approve.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  statusFilter === filter
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading approvals...
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold">No approval requests found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {statusFilter === 'pending'
                ? 'All pending requests have been reviewed. There is no pending backlog.'
                : 'No requests match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="transition-all hover:border-primary/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted border border-border">
                      {getTypeIcon(req.request_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold capitalize">
                          {req.request_type.replace(/_/g, ' ')}
                        </CardTitle>
                        {getStatusBadge(req.status)}
                      </div>
                      <CardDescription className="text-xs mt-1">
                        Target: <span className="font-mono text-foreground">{req.entity_type} #{req.entity_id.slice(0, 8)}</span>
                      </CardDescription>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('rejected');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('approved');
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="text-xs space-y-3 pt-0">
                {/* Payload details */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
                  <span className="font-medium text-foreground">Requested Parameters:</span>
                  <pre className="mt-1 text-[11px] font-mono text-muted-foreground overflow-x-auto">
                    {JSON.stringify(req.requested_payload, null, 2)}
                  </pre>
                </div>

                {/* Audit trail metadata */}
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Requested by: <strong className="text-foreground">{req.requester?.full_name || 'Agent'}</strong></span>
                  </div>
                  {req.reviewer && (
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      <span>Reviewed by: <strong className="text-foreground">{req.reviewer?.full_name}</strong></span>
                    </div>
                  )}
                  <div>
                    Submitted: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>

                {req.rejection_reason && (
                  <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <strong>Rejection reason:</strong> {req.rejection_reason}
                  </div>
                )}
                {req.approval_notes && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs">
                    <strong>Approval note:</strong> {req.approval_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approved' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Grant Manager Approval
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Reject Approval Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approved'
                ? 'Confirming this approval will execute the requested action according to 4-eyes governance rules.'
                : 'Provide a reason so the requesting agent understands why this was declined.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="review-notes">
              {actionType === 'approved' ? 'Manager Notes (Optional)' : 'Rejection Reason (Required)'}
            </Label>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionType === 'approved'
                  ? 'e.g. Verified customer lifetime value and approved discount.'
                  : 'e.g. Price discount exceeds allowable 15% threshold without director authorization.'
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={submitting || (actionType === 'rejected' && !notes.trim())}
              className={actionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              variant={actionType === 'rejected' ? 'destructive' : 'default'}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
