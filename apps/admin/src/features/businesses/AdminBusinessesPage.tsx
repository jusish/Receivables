import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@receivables/ui';
import { Search, Eye, Plus, Building2, CheckCircle2, UserPlus } from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { adminApiFetch } from '../../lib/api';

export const AdminBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<any | null>(null);

  // Form states - Register
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currency, setCurrency] = useState('RWF');
  const [timezone, setTimezone] = useState('Africa/Kigali');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // Form states - Assign Owner
  const [assignName, setAssignName] = useState('');
  const [assignPhone, setAssignPhone] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await adminApiFetch(`/admin/businesses${query}`);
      setBusinesses(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load businesses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [search]);

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await adminApiFetch('/admin/businesses', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          currency,
          timezone,
          ownerFullName: ownerFullName.trim() || undefined,
          ownerPhone: ownerPhone.trim() || undefined,
        }),
      });

      setFeedback({
        type: 'success',
        message: ownerPhone
          ? 'Tenant business registered and owner assigned! The owner can log in or set password via OTP.'
          : 'Tenant business registered successfully!',
      });
      setCreateOpen(false);
      setName('');
      setCode('');
      setOwnerFullName('');
      setOwnerPhone('');
      loadBusinesses();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to register business' });
    }
  };

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;
    setAssignSubmitting(true);
    setFeedback(null);

    try {
      const res = await adminApiFetch(`/admin/businesses/${selectedBiz.id}/assign-owner`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: assignName.trim(),
          phone: assignPhone.trim(),
        }),
      });

      setFeedback({
        type: 'success',
        message: res.message || `Owner successfully assigned to ${selectedBiz.name}!`,
      });
      setAssignOpen(false);
      setAssignName('');
      setAssignPhone('');
      loadBusinesses();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign owner' });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    if (!selectedBiz) return;
    try {
      await adminApiFetch(`/admin/businesses/${selectedBiz.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      setFeedback({
        type: 'success',
        message: `Business status updated to ${newStatus}!`,
      });
      setManageOpen(false);
      loadBusinesses();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status' });
    }
  };

  const openAssignModal = (biz: any) => {
    setSelectedBiz(biz);
    setAssignName('');
    setAssignPhone('');
    setAssignOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950/60 text-rose-300 border border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tenant Businesses</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-tenant company organizations, provision new workspaces, and assign owner admins.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs shadow-md"
        >
          <Plus className="w-4 h-4" />
          Register Business
        </Button>
      </div>

      {/* Filter and Table Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search businesses by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Total Organizations: {businesses.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold text-xs">Code</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs">Business Name</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs">Currency</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs text-center">Admin / Users</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs text-right">Invoices</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs text-right">Outstanding Ledger</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs">Status</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800">
                {loading && businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      Loading organizations from database...
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      No businesses found matching your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((biz) => {
                    const hasNoUsers = biz.usersCount === 0;
                    return (
                      <TableRow key={biz.id} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell className="font-mono text-xs font-semibold text-indigo-400">
                          {biz.code}
                        </TableCell>
                        <TableCell className="font-medium text-white">{biz.name}</TableCell>
                        <TableCell className="text-xs text-slate-300">{biz.currency}</TableCell>
                        <TableCell className="text-center">
                          {hasNoUsers ? (
                            <button
                              type="button"
                              onClick={() => openAssignModal(biz)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                            >
                              <UserPlus className="w-3 h-3" />
                              Assign Owner
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">
                              {biz.usersCount} member{biz.usersCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-300">
                          {biz.receivablesCount}
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold text-emerald-400">
                          {formatMoney(biz.outstanding, biz.currency || 'RWF')}
                        </TableCell>
                        <TableCell>
                          {biz.status === 'ACTIVE' ? (
                            <Badge variant="success" className="text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              {biz.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasNoUsers && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignModal(biz)}
                                className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 h-7 px-2 gap-1"
                              >
                                <UserPlus className="w-3 h-3" />
                                Owner
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBiz(biz);
                                setManageOpen(true);
                              }}
                              className="text-xs text-slate-300 hover:text-white h-7 gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Manage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ASSIGN OWNER MODAL */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Assign Business Owner</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Assign an administrator / owner for{' '}
              <strong className="text-white">{selectedBiz?.name}</strong> ({selectedBiz?.code}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignOwner} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
              <p className="font-semibold mb-1">Self-Serve Password Setup:</p>
              The user will be granted full <strong>BUSINESS_OWNER</strong> authority. If they do not
              have a password yet, they can set one on the business portal using{' '}
              <strong>Forgot Password / OTP</strong>.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Owner Full Name *
              </label>
              <Input
                placeholder="e.g. Jean Paul Habimana"
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Owner Phone Number (Login Phone) *
              </label>
              <Input
                placeholder="+250 788 123 456"
                value={assignPhone}
                onChange={(e) => setAssignPhone(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
              >
                {assignSubmitting ? 'Assigning...' : 'Assign Business Owner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REGISTER BUSINESS MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Register Tenant Business</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Provision a new isolated organization workspace with optional initial owner.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterBusiness} className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Business Legal Name *
              </label>
              <Input
                placeholder="e.g. Rubavu Logistics Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Unique Code (Prefix) *
              </label>
              <Input
                placeholder="e.g. BIZ-RUB"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 uppercase font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Default Currency
                </label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Timezone</label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            {/* Optional initial owner */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Initial Business Owner (Optional)
              </p>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Owner Full Name
                </label>
                <Input
                  placeholder="e.g. Eric Manzi"
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Owner Phone Number
                </label>
                <Input
                  placeholder="+250 788 123 456"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                Register Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MANAGE BUSINESS MODAL */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>{selectedBiz?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Workspace Code: {selectedBiz?.code} • Registered: {selectedBiz?.createdAt}
            </DialogDescription>
          </DialogHeader>

          {selectedBiz && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-2 p-3 rounded bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="font-bold text-white mt-0.5">{selectedBiz.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Members:</span>
                  <p className="font-bold text-white mt-0.5">{selectedBiz.usersCount}</p>
                </div>
                <div>
                  <span className="text-slate-400">Receivables:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedBiz.receivablesCount}</p>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Total Outstanding Ledger:</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {formatMoney(selectedBiz.outstanding, selectedBiz.currency || 'RWF')}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setManageOpen(false);
                    openAssignModal(selectedBiz);
                  }}
                  className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Assign / Add Owner
                </Button>

                {selectedBiz.status === 'ACTIVE' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus('SUSPENDED')}
                    className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
                  >
                    Suspend Tenant
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleToggleStatus('ACTIVE')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    Activate Tenant
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setManageOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
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
