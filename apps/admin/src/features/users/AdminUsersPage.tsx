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
import { Search, Plus, UserCheck, ShieldCheck, CheckCircle2, AlertTriangle, Edit } from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Create Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [adminRole, setAdminRole] = useState('SUPER_ADMIN');

  // Edit Form
  const [editRole, setEditRole] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await adminApiFetch(`/admin/users${query}`);
      setUsers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load platform users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await adminApiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          password,
          adminRole: adminRole || undefined,
        }),
      });

      setFeedback({ type: 'success', message: 'Platform user account provisioned successfully!' });
      setCreateOpen(false);
      setFullName('');
      setPhone('');
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user' });
    }
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.adminRole || '');
    setEditIsActive(user.isActive);
    setEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFeedback(null);
    try {
      await adminApiFetch(`/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          adminRole: editRole || null,
          isActive: editIsActive,
        }),
      });

      setFeedback({ type: 'success', message: 'User privileges updated successfully!' });
      setEditOpen(false);
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/70 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Platform Users & Admins</h2>
          <p className="text-sm text-slate-400 mt-1">
            Global directory of user accounts, administrator privileges, and tenant assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedback(null);
            setCreateOpen(true);
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Platform User
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by full name or phone..."
              className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Full Name</TableHead>
                <TableHead className="text-slate-400">Phone</TableHead>
                <TableHead className="text-slate-400">Admin Privileges</TableHead>
                <TableHead className="text-slate-400">Tenant Memberships</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Created</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading platform user accounts...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No users matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="font-medium text-white flex items-center gap-2 py-4">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>{u.fullName}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{u.phone}</TableCell>
                    <TableCell>
                      {u.adminRole ? (
                        <Badge
                          variant="outline"
                          className="bg-indigo-950/60 border-indigo-500/40 text-indigo-300 text-[10px] uppercase font-bold"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {u.adminRole}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-xs truncate">
                      {u.businesses?.length > 0 ? u.businesses.join(', ') : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="success" className="text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{u.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(u)}
                        className="text-xs text-slate-300 hover:text-white gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE USER MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Provision Platform User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a user account with optional administrative privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <Input
                placeholder="e.g. Samuel Mugisha"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Phone Number (E.164)</label>
              <Input
                placeholder="+250 788 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Default Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Admin Role Privileges</label>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-white text-sm"
              >
                <option value="">None (Standard Tenant User)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Technical Infrastructure)</option>
                <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Service)</option>
                <option value="READ_ONLY_ADMIN">READ_ONLY_ADMIN (Auditor)</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT PRIVILEGES MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User: {selectedUser?.fullName}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update platform roles and toggle account active status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Admin Role Privileges</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-white text-sm"
              >
                <option value="">None (Standard Tenant User)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Technical Infrastructure)</option>
                <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Service)</option>
                <option value="READ_ONLY_ADMIN">READ_ONLY_ADMIN (Auditor)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 rounded bg-slate-950 border border-slate-800">
              <input
                type="checkbox"
                id="userActiveCheck"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
              />
              <label htmlFor="userActiveCheck" className="text-xs font-medium text-slate-300 cursor-pointer">
                Account Active & Authorized to Sign In
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
