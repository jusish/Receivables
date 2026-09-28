import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  SearchableSelect,
} from '@receivables/ui';
import { Plus, Search, Eye, CheckCircle, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [customerReceivables, setCustomerReceivables] = useState<any[]>([]);
  const [targetReceivableId, setTargetReceivableId] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await apiFetch(`/payments${query}`);
      setPayments(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load payments' });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await apiFetch('/customers');
      setCustomers(data);
      if (data.length > 0 && !customerId) {
        setCustomerId(data[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, []);

  // When customer selection changes in modal, load their active receivables for allocation
  useEffect(() => {
    if (!customerId) return;
    apiFetch(`/receivables?customerId=${customerId}&status=ACTIVE`)
      .then((recs) => {
        setCustomerReceivables(recs);
        if (recs.length > 0) {
          setTargetReceivableId(recs[0].id);
        } else {
          setTargetReceivableId('');
        }
      })
      .catch(() => setCustomerReceivables([]));
  }, [customerId]);

  const handleOpenView = async (pay: any) => {
    setSelectedPayment(pay);
    setViewOpen(true);
    try {
      const detailed = await apiFetch(`/payments/${pay.id}`);
      setSelectedPayment(detailed);
    } catch {
      // fallback
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          amount: Number(amount),
          paymentMethod,
          reference: reference.trim() || undefined,
          paymentDate,
          notes: notes.trim() || undefined,
          targetReceivableId: targetReceivableId || undefined,
        }),
      });

      setFeedback({ type: 'success', message: 'Payment recorded and allocated successfully!' });
      setCreateOpen(false);
      setAmount('');
      setReference('');
      setNotes('');
      loadPayments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record payment' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h2>
          <p className="text-sm text-slate-500 mt-1">
            Recorded customer payments, allocations to receivables, and credit reconciliation.
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedback(null);
            setCreateOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search payment ref or customer..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount Received</TableHead>
                <TableHead className="text-right">Unallocated</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Txn Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Loading payments records...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    No payment transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell className="font-mono text-xs font-semibold text-emerald-600">
                      {pay.ref || pay.referenceNumber}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{pay.customer}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatMoney(pay.amount, 'RWF')}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatMoney(pay.unallocated, 'RWF')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {pay.method?.replace('_', ' ') || pay.paymentMethod?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {pay.reference}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{pay.date}</TableCell>
                    <TableCell>
                      <Badge variant="success">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenView(pay)}
                        className="gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Customer Payment</DialogTitle>
            <DialogDescription>
              Record an incoming cash, bank transfer or Mobile Money payment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Paying Customer *
              </label>
              <SearchableSelect
                options={customers
                  .filter((c) => c.status !== 'INACTIVE')
                  .map((c) => ({
                    value: c.id,
                    label: c.name,
                    subLabel: `${c.phone}${c.outstandingBalance ? ` • Balance: ${formatMoney(c.outstandingBalance, 'RWF')}` : ''}`,
                    badge: c.customerCode,
                  }))}
                value={customerId}
                onChange={setCustomerId}
                placeholder="Search or select paying customer..."
                searchPlaceholder="Search customer by name or phone..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount Received (RWF) *
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 350000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  className="text-xs"
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Date *
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Method *
                </label>
                <SearchableSelect
                  options={[
                    { value: 'MOBILE_MONEY', label: 'MTN Mobile Money / MoMo', subLabel: 'Instant digital wallet' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer / RTGS', subLabel: 'Direct bank transfer' },
                    { value: 'CASH', label: 'Cash Payment', subLabel: 'Physical cash received' },
                    { value: 'CHEQUE', label: 'Bank Cheque', subLabel: 'Commercial bank cheque' },
                    { value: 'OTHER', label: 'Other Method', subLabel: 'Other settlement' },
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  placeholder="Select payment method..."
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Transaction Reference
                </label>
                <Input
                  placeholder="e.g. MOMO-987123"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Receivable Allocation Selector */}
            {customerReceivables.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Allocate Directly to Receivable (Optional)
                </label>
                <SearchableSelect
                  options={[
                    {
                      value: '',
                      label: 'Auto-allocate to oldest open invoices (Recommended)',
                      subLabel: 'Waterfall distribution',
                    },
                    ...customerReceivables.map((r) => ({
                      value: r.id,
                      label: `${r.referenceNumber || r.ref} (${formatMoney(r.outstanding || r.outstandingBalance, 'RWF')} due)`,
                      subLabel: `Status: ${r.status}`,
                      badge: r.status,
                    })),
                  ]}
                  value={targetReceivableId}
                  onChange={setTargetReceivableId}
                  placeholder="Select invoice to allocate payment..."
                  searchPlaceholder="Search invoices..."
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
              <Input
                placeholder="e.g. Bank slip acknowledged by accountant"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Record & Allocate Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW PAYMENT MODAL */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>{selectedPayment?.ref || selectedPayment?.referenceNumber}</span>
              </DialogTitle>
              <Badge variant="success">Completed</Badge>
            </div>
            <DialogDescription>
              Received from {selectedPayment?.customer || selectedPayment?.customer?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <span className="text-xs text-emerald-700 font-semibold uppercase">
                  Payment Amount
                </span>
                <p className="text-2xl font-bold text-emerald-950 mt-1">
                  {formatMoney(selectedPayment.amount, 'RWF')}
                </p>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Method:</strong>{' '}
                    {selectedPayment.method || selectedPayment.paymentMethod}
                  </p>
                  <p>
                    <strong>Reference:</strong> {selectedPayment.reference || '—'}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedPayment.date}
                  </p>
                </div>
              </div>

              {/* Allocations */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Receivable Allocations
                </h4>
                {selectedPayment.allocations && selectedPayment.allocations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayment.allocations.map((al: any) => (
                      <div
                        key={al.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono font-semibold text-blue-600">
                            {al.receivableRef || al.receivable?.referenceNumber}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatMoney(al.amount, 'RWF')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Unallocated: {formatMoney(selectedPayment.unallocatedAmount || selectedPayment.unallocated, 'RWF')}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
