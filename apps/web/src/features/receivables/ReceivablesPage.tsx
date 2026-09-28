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
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  SlidersHorizontal,
  XCircle,
  PlusCircle,
  Trash2,
  FileSpreadsheet,
  Coins,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';

export const ReceivablesPage: React.FC = () => {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [selectedReceivable, setSelectedReceivable] = useState<any | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  // Form states for Create Receivable (Direct Amount is default)
  const [createMode, setCreateMode] = useState<'DIRECT' | 'ITEMIZED'>('DIRECT');
  const [directDescription, setDirectDescription] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSourceType, setNewSourceType] = useState('DELIVERY');
  const [newSourceRef, setNewSourceRef] = useState('');
  const [newItems, setNewItems] = useState([
    { description: 'Delivery of goods', quantity: 1, unitPrice: 0, totalAmount: 0 },
  ]);

  // Form states for Adjust Receivable
  const [adjType, setAdjType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // Form states for Cancel Receivable
  const [cancelReason, setCancelReason] = useState('');

  const loadReceivables = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (activeTab !== 'ALL') queryParams.append('status', activeTab);
      if (search.trim()) queryParams.append('search', search.trim());

      const data = await apiFetch(`/receivables?${queryParams.toString()}`);
      setReceivables(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load receivables' });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await apiFetch('/customers');
      setCustomers(data);
      if (data.length > 0 && !newCustomerId) {
        setNewCustomerId(data[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadReceivables();
  }, [activeTab, search]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const openDetails = async (rec: any) => {
    setSelectedReceivable(rec);
    setDetailsOpen(true);
    try {
      const detailed = await apiFetch(`/receivables/${rec.id}`);
      setSelectedDetail(detailed);
    } catch {
      setSelectedDetail(rec);
    }
  };

  const handleCreateItemChange = (index: number, field: string, value: any) => {
    const updated = [...newItems];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 0;
      const p = Number(updated[index].unitPrice) || 0;
      updated[index].totalAmount = q * p;
    }
    setNewItems(updated);

    const total = updated.reduce((s, it) => s + (Number(it.totalAmount) || 0), 0);
    setNewAmount(String(total));
  };

  const handleAddItem = () => {
    setNewItems([
      ...newItems,
      { description: 'Additional Item', quantity: 1, unitPrice: 0, totalAmount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (newItems.length === 1) return;
    const updated = newItems.filter((_, i) => i !== index);
    setNewItems(updated);
    const total = updated.reduce((s, it) => s + (Number(it.totalAmount) || 0), 0);
    setNewAmount(String(total));
  };

  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const amount = Number(newAmount);
    if (!amount || amount <= 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid receivable amount greater than zero.',
      });
      return;
    }
    if (!newCustomerId) {
      setFeedback({
        type: 'error',
        message: 'Please select a customer for this receivable.',
      });
      return;
    }

    try {
      const itemsToSend =
        createMode === 'DIRECT'
          ? [
              {
                description:
                  directDescription.trim() || 'Accounts Receivable Invoice Record',
                quantity: 1,
                unitPrice: amount,
                totalAmount: amount,
              },
            ]
          : newItems.map((it) => ({
              description: it.description,
              quantity: Number(it.quantity),
              unitPrice: Number(it.unitPrice),
              totalAmount: Number(it.totalAmount),
            }));

      await apiFetch('/receivables', {
        method: 'POST',
        body: JSON.stringify({
          customerId: newCustomerId,
          referenceNumber: newRef.trim() || undefined,
          originalAmount: amount,
          dueDate: newDueDate || undefined,
          sourceType: newSourceType,
          sourceReference: newSourceRef.trim() || undefined,
          status: 'ACTIVE',
          items: itemsToSend,
        }),
      });

      setFeedback({ type: 'success', message: 'Receivable created successfully!' });
      setCreateOpen(false);
      setNewRef('');
      setNewAmount('');
      setDirectDescription('');
      loadReceivables();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create receivable' });
    }
  };

  const handleActivate = async () => {
    if (!selectedReceivable) return;
    try {
      await apiFetch(`/receivables/${selectedReceivable.id}/activate`, { method: 'POST' });
      setFeedback({ type: 'success', message: 'Receivable successfully activated!' });
      setDetailsOpen(false);
      loadReceivables();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Activation failed' });
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    try {
      await apiFetch(`/receivables/${selectedReceivable.id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({
          type: adjType,
          amount: Number(adjAmount),
          reason: adjReason,
        }),
      });

      setFeedback({ type: 'success', message: 'Adjustment successfully applied!' });
      setAdjustOpen(false);
      setDetailsOpen(false);
      loadReceivables();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Adjustment failed' });
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;
    try {
      await apiFetch(`/receivables/${selectedReceivable.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({
          reason: cancelReason,
        }),
      });

      setFeedback({ type: 'success', message: 'Receivable successfully cancelled!' });
      setCancelOpen(false);
      setDetailsOpen(false);
      loadReceivables();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
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

      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Receivables</h2>
          <p className="text-sm text-slate-500 mt-1">
            Accounts receivable records, activation triggers, terms, and payment statuses.
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedback(null);
            setCreateOpen(true);
          }}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Create Receivable
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search receivable ref or customer..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Quick status filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'PENDING', 'ACTIVE', 'OVERDUE', 'PAID', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Loading accounts receivable records...
                  </TableCell>
                </TableRow>
              ) : receivables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No receivables found for the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                receivables.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-mono text-xs font-semibold text-blue-600">
                      {rec.ref || rec.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{rec.customer}</p>
                        <p className="text-xs text-slate-500">{rec.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(rec.originalAmount, rec.currency || 'RWF')}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">
                      {formatMoney(rec.paidAmount, rec.currency || 'RWF')}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatMoney(rec.outstanding, rec.currency || 'RWF')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium text-slate-800">
                          {rec.dueDate || 'No Due Date'}
                        </p>
                        {rec.isOverdue && (
                          <span className="text-[10px] font-semibold text-rose-600 block">
                            {rec.overdueDays} days overdue
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rec.status === 'PAID' && <Badge variant="success">Paid</Badge>}
                      {rec.status === 'ACTIVE' && rec.isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {rec.status === 'ACTIVE' && !rec.isOverdue && (
                        <Badge variant="default">Active</Badge>
                      )}
                      {rec.status === 'PARTIALLY_PAID' && (
                        <Badge variant="warning">Partially Paid</Badge>
                      )}
                      {(rec.status === 'PENDING_ACTIVATION' || rec.status === 'DRAFT') && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {rec.status === 'CANCELLED' && (
                        <Badge variant="outline" className="text-slate-400 border-slate-300">
                          Cancelled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(rec)}
                        className="gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE RECEIVABLE MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Receivable</DialogTitle>
            <DialogDescription>
              Record a new delivery, invoice or sales order receivable.
            </DialogDescription>
          </DialogHeader>

          {/* Segmented Mode Selector: Direct Amount vs Itemized */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => setCreateMode('DIRECT')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                createMode === 'DIRECT'
                  ? 'bg-white shadow-xs text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Direct Amount Entry (Default)
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('ITEMIZED')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                createMode === 'ITEMIZED'
                  ? 'bg-white shadow-xs text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Itemized Line Items
            </button>
          </div>

          <form onSubmit={handleCreateReceivable} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer *
                </label>
                <SearchableSelect
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                    subLabel: `${c.phone}${c.creditLimit ? ` • Limit: ${formatMoney(c.creditLimit, 'RWF')}` : ''}`,
                    badge: c.customerCode,
                  }))}
                  value={newCustomerId}
                  onChange={setNewCustomerId}
                  placeholder="Select or search customer..."
                  searchPlaceholder="Search customer by name, code or phone..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reference Number
                </label>
                <Input
                  placeholder="Auto-generated if blank (e.g. REC-000189)"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Source Type</label>
                <SearchableSelect
                  options={[
                    { value: 'DELIVERY', label: 'Delivery Note', subLabel: 'Goods delivery confirmation' },
                    { value: 'INVOICE', label: 'Tax Invoice', subLabel: 'Commercial sales invoice' },
                    { value: 'SALES_ORDER', label: 'Sales Order', subLabel: 'Customer approved purchase order' },
                    { value: 'MANUAL', label: 'Manual Record', subLabel: 'Direct receivable ledger entry' },
                  ]}
                  value={newSourceType}
                  onChange={setNewSourceType}
                  placeholder="Select source document type..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Source Document Reference (Optional)
              </label>
              <Input
                placeholder="e.g. DEL-2026-105 or PO-889"
                value={newSourceRef}
                onChange={(e) => setNewSourceRef(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Direct Amount Mode */}
            {createMode === 'DIRECT' ? (
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Total Receivable Amount (RWF) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">RWF</span>
                    <Input
                      type="number"
                      placeholder="e.g. 500000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                      min="1"
                      className="pl-14 text-sm font-semibold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Invoice Memo / Description (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Bulk order supplies or monthly service charge"
                    value={directDescription}
                    onChange={(e) => setDirectDescription(e.target.value)}
                    className="text-xs bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Itemized Mode */
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Line Items Breakdown</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-7 text-xs gap-1"
                  >
                    <PlusCircle className="w-3 h-3" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {newItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            handleCreateItemChange(index, 'description', e.target.value)
                          }
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleCreateItemChange(index, 'quantity', Number(e.target.value))
                          }
                          min="1"
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            handleCreateItemChange(index, 'unitPrice', Number(e.target.value))
                          }
                          min="0"
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {item.totalAmount}
                        </span>
                        {newItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">Total Receivable Amount:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatMoney(Number(newAmount) || 0, 'RWF')}
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Create & Activate Receivable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAILS MODAL */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span>{selectedReceivable?.ref || selectedReceivable?.referenceNumber}</span>
                  <Badge variant={selectedReceivable?.status === 'PAID' ? 'success' : 'default'}>
                    {selectedReceivable?.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Customer: {selectedReceivable?.customer} ({selectedReceivable?.customerPhone})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-6 pt-2">
              {/* Balances overview card */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Original Amount:</span>
                  <p className="text-base font-bold text-slate-900">
                    {formatMoney(selectedDetail.originalAmount, selectedDetail.currency || 'RWF')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Paid Amount:</span>
                  <p className="text-base font-bold text-emerald-600">
                    {formatMoney(selectedDetail.paidAmount, selectedDetail.currency || 'RWF')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Remaining Balance:</span>
                  <p className="text-base font-bold text-blue-600">
                    {formatMoney(selectedDetail.outstanding, selectedDetail.currency || 'RWF')}
                  </p>
                </div>
              </div>

              {/* Line items table */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Billed Items
                </h4>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDetail.items?.map((it: any) => (
                        <tr key={it.id}>
                          <td className="p-2 font-medium text-slate-900">{it.description}</td>
                          <td className="p-2 text-right">{it.quantity}</td>
                          <td className="p-2 text-right">
                            {formatMoney(it.unitPrice, selectedDetail.currency || 'RWF')}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {formatMoney(it.totalAmount, selectedDetail.currency || 'RWF')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment allocations */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Allocated Payments ({selectedDetail.allocations?.length || 0})
                </h4>
                {selectedDetail.allocations && selectedDetail.allocations.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="p-2 text-left">Payment Ref</th>
                          <th className="p-2 text-left">Method</th>
                          <th className="p-2 text-right">Allocated Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDetail.allocations.map((al: any) => (
                          <tr key={al.id}>
                            <td className="p-2 font-mono text-emerald-600 font-semibold">
                              {al.payment?.referenceNumber}
                            </td>
                            <td className="p-2 text-slate-600">{al.payment?.paymentMethod}</td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              {formatMoney(al.amount, selectedDetail.currency || 'RWF')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No payments allocated yet.</p>
                )}
              </div>

              {/* Adjustments */}
              {selectedDetail.adjustments && selectedDetail.adjustments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                    Adjustments & Credits
                  </h4>
                  <div className="space-y-1.5">
                    {selectedDetail.adjustments.map((adj: any) => (
                      <div
                        key={adj.id}
                        className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <Badge variant="outline" className="text-[10px] mr-2">
                            {adj.type}
                          </Badge>
                          <span className="text-slate-700">{adj.reason}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatMoney(adj.amount, selectedDetail.currency || 'RWF')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(selectedDetail.status === 'DRAFT' ||
                    selectedDetail.status === 'PENDING_ACTIVATION') && (
                    <Button
                      size="sm"
                      onClick={handleActivate}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Activate Receivable
                    </Button>
                  )}

                  {selectedDetail.status !== 'PAID' && selectedDetail.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdjustOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Add Adjustment
                    </Button>
                  )}

                  {selectedDetail.paidAmount === 0 && selectedDetail.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelOpen(true)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Receivable
                    </Button>
                  )}
                </div>

                <Button variant="ghost" size="sm" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADJUST RECEIVABLE MODAL */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Adjustment</DialogTitle>
            <DialogDescription>
              Apply a credit note (reduce owed) or debit adjustment to{' '}
              {selectedReceivable?.referenceNumber}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Adjustment Type</label>
              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as any)}
                className="w-full mt-1 h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="CREDIT">CREDIT (Reduce customer balance)</option>
                <option value="DEBIT">DEBIT (Increase customer balance)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Amount (RWF)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                required
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Reason</label>
              <Input
                placeholder="e.g. Damaged packages returned upon delivery"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CANCEL RECEIVABLE MODAL */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Receivable</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {selectedReceivable?.referenceNumber}? Outstanding
              balance will be set to 0.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancel} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Reason for Cancellation</label>
              <Input
                placeholder="e.g. Client requested order cancellation prior to dispatch"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
                Go Back
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
