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
} from '@receivables/ui';
import {
  Plus,
  Search,
  Phone,
  Eye,
  CheckCircle,
  AlertTriangle,
  Building,
  MapPin,
  Edit2,
  UserX,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<any | null>(null);
  const [customerToToggle, setCustomerToToggle] = useState<any | null>(null);

  // Create Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await apiFetch(`/customers${query}`);
      setCustomers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load customers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleOpenView = async (cus: any) => {
    setSelectedCustomer(cus);
    setViewOpen(true);
    try {
      const detailed = await apiFetch(`/customers/${cus.id}`);
      setCustomerDetail(detailed);
    } catch {
      setCustomerDetail(cus);
    }
  };

  const handleOpenEdit = (cus: any) => {
    setCustomerToEdit(cus);
    setEditName(cus.name || '');
    setEditPhone(cus.phone || '');
    setEditAddress(cus.address || '');
    setEditCreditLimit(cus.creditLimit ? String(cus.creditLimit) : '0');
    setEditNotes(cus.notes || '');
    setEditOpen(true);
  };

  const handleOpenToggle = (cus: any) => {
    setCustomerToToggle(cus);
    setConfirmToggleOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim() || undefined,
          creditLimit: creditLimit ? Number(creditLimit) : 0,
          notes: notes.trim() || undefined,
        }),
      });

      setFeedback({ type: 'success', message: 'Customer account added successfully!' });
      setCreateOpen(false);
      setName('');
      setPhone('');
      setAddress('');
      setCreditLimit('');
      setNotes('');
      loadCustomers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create customer' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToEdit) return;
    setSavingEdit(true);
    setFeedback(null);

    try {
      await apiFetch(`/customers/${customerToEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim() || undefined,
          creditLimit: editCreditLimit ? Number(editCreditLimit) : 0,
          notes: editNotes.trim() || undefined,
        }),
      });

      setFeedback({
        type: 'success',
        message: `Customer ${editName} updated successfully. Historical records retain their original snapshot.`,
      });
      setEditOpen(false);
      loadCustomers();
      if (viewOpen && selectedCustomer?.id === customerToEdit.id) {
        handleOpenView({ ...selectedCustomer, name: editName, phone: editPhone });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update customer' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!customerToToggle) return;
    const nextStatus = customerToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiFetch(`/customers/${customerToToggle.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });

      setFeedback({
        type: 'success',
        message: `Customer ${customerToToggle.name} ${
          nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'
        } successfully.`,
      });
      setConfirmToggleOpen(false);
      loadCustomers();
      if (viewOpen && selectedCustomer?.id === customerToToggle.id) {
        setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
        if (customerDetail) setCustomerDetail({ ...customerDetail, status: nextStatus });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to change customer status',
      });
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer accounts, credit limits, phone contacts, and active status.
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
          Add Customer
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone or code..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Loading customer directory...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No customers found matching search.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((cus) => (
                  <TableRow key={cus.id} className={cus.status === 'INACTIVE' ? 'opacity-65' : ''}>
                    <TableCell className="font-mono text-xs font-semibold text-blue-600">
                      {cus.customerCode}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{cus.name}</TableCell>
                    <TableCell className="text-slate-600 flex items-center gap-1.5 py-4">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cus.phone}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(cus.outstanding, 'RWF')}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-rose-600">
                      {cus.overdue > 0 ? formatMoney(cus.overdue, 'RWF') : '—'}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatMoney(cus.creditLimit, 'RWF')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cus.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {cus.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(cus)}
                          className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700"
                          title="View Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cus)}
                          className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenToggle(cus)}
                          className={`h-8 px-2 text-xs ${
                            cus.status === 'ACTIVE'
                              ? 'text-rose-600 hover:text-rose-700'
                              : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                          title={cus.status === 'ACTIVE' ? 'Deactivate Customer' : 'Activate Customer'}
                        >
                          {cus.status === 'ACTIVE' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE CUSTOMER MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer Account</DialogTitle>
            <DialogDescription>
              Register a customer to track credit receivables and payments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Customer / Company Name</label>
              <Input
                placeholder="e.g. Kigali Supermarket Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number (E.164)</label>
              <Input
                placeholder="+250 788 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Business Address (Optional)</label>
              <Input
                placeholder="e.g. Kigali, Gasabo KG 9 Ave"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Credit Limit (RWF)</label>
              <Input
                type="number"
                placeholder="e.g. 5000000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
              <Input
                placeholder="e.g. Approved for 30-day payment terms"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CUSTOMER MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer Account</DialogTitle>
            <DialogDescription>
              Update contact information and credit parameters for {customerToEdit?.customerCode}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Snapshot Guarantee:</strong> Historical receivables and receipts preserve the
                original name and phone snapshot from when they were issued.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Customer / Company Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number (E.164)</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Business Address</label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Credit Limit (RWF)</label>
              <Input
                type="number"
                value={editCreditLimit}
                onChange={(e) => setEditCreditLimit(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Notes</label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM TOGGLE STATUS MODAL */}
      <Dialog open={confirmToggleOpen} onOpenChange={setConfirmToggleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {customerToToggle?.status === 'ACTIVE'
                ? 'Deactivate Customer Account'
                : 'Activate Customer Account'}
            </DialogTitle>
            <DialogDescription>
              {customerToToggle?.status === 'ACTIVE' ? (
                <>
                  Are you sure you want to deactivate <strong>{customerToToggle?.name}</strong>?
                  Deactivating will hide this customer when issuing new invoices or recording
                  payments. All historical balances, statements, and payment records remain
                  permanently preserved.
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong>{customerToToggle?.name}</strong>?
                  This will make them available again for issuing new invoices and recording payments.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setConfirmToggleOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmToggle}
              className={
                customerToToggle?.status === 'ACTIVE'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {customerToToggle?.status === 'ACTIVE'
                ? 'Confirm Deactivation'
                : 'Confirm Activation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW CUSTOMER MODAL */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>{selectedCustomer?.name}</span>
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-semibold text-blue-600">
                    {selectedCustomer?.customerCode}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedCustomer?.phone}
                  </span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedCustomer?.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {selectedCustomer?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewOpen(false);
                    handleOpenEdit(selectedCustomer);
                  }}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
          </DialogHeader>

          {customerDetail && (
            <div className="space-y-6 pt-2">
              {customerDetail.status === 'INACTIVE' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    This customer account is inactive. New invoices or payments cannot be issued, but
                    all historical transactions and balances are securely preserved.
                  </span>
                </div>
              )}

              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Credit Limit:</span>
                  <p className="text-base font-bold text-slate-900">
                    {formatMoney(customerDetail.creditLimit, 'RWF')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Total Outstanding:</span>
                  <p className="text-base font-bold text-blue-600">
                    {formatMoney(customerDetail.outstanding, 'RWF')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Overdue Balance:</span>
                  <p className="text-base font-bold text-rose-600">
                    {formatMoney(customerDetail.overdue, 'RWF')}
                  </p>
                </div>
              </div>

              {customerDetail.address && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{customerDetail.address}</span>
                </div>
              )}

              {/* Receivables Ledger */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Accounts Receivable Invoices ({customerDetail.receivables?.length || 0})
                </h4>
                {customerDetail.receivables && customerDetail.receivables.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="p-2 text-left">Ref</th>
                          <th className="p-2 text-right">Original</th>
                          <th className="p-2 text-right">Outstanding</th>
                          <th className="p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerDetail.receivables.map((r: any) => (
                          <tr key={r.id}>
                            <td className="p-2 font-mono font-semibold text-blue-600">
                              {r.referenceNumber}
                            </td>
                            <td className="p-2 text-right">{formatMoney(r.originalAmount, 'RWF')}</td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              {formatMoney(r.outstandingBalance, 'RWF')}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={r.status === 'PAID' ? 'success' : 'default'}
                                className="text-[10px]"
                              >
                                {r.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No receivables recorded yet.</p>
                )}
              </div>

              {/* Payments Ledger */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Payment History ({customerDetail.payments?.length || 0})
                </h4>
                {customerDetail.payments && customerDetail.payments.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="p-2 text-left">Payment Ref</th>
                          <th className="p-2 text-left">Method</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerDetail.payments.map((p: any) => (
                          <tr key={p.id}>
                            <td className="p-2 font-mono font-semibold text-emerald-600">
                              {p.referenceNumber}
                            </td>
                            <td className="p-2 text-slate-600">{p.paymentMethod}</td>
                            <td className="p-2 text-right font-bold text-emerald-600">
                              {formatMoney(p.amount, 'RWF')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No payments recorded yet.</p>
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
