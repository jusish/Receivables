import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  SearchableSelect,
} from '@receivables/ui';
import {
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Clock,
  Layers,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [collectionsEnabled, setCollectionsEnabled] = useState(true);
  const [agingSchedule, setAgingSchedule] = useState('standard');
  const [customAgingDays, setCustomAgingDays] = useState('15, 30, 45, 60');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Invite Modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('ACCOUNTANT');

  const loadProfile = async () => {
    try {
      const data = await apiFetch('/business');
      setProfile(data);
      setName(data.name || '');
      setTimezone(data.timezone || 'Africa/Kigali');
      if (data.settings) {
        setCollectionsEnabled(data.settings.collectionsEnabled !== false);
        setAgingSchedule(data.settings.agingSchedule || 'standard');
        if (data.settings.customAgingDays && Array.isArray(data.settings.customAgingDays)) {
          setCustomAgingDays(data.settings.customAgingDays.join(', '));
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load business profile' });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const parsedCustomDays = customAgingDays
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);

      await apiFetch('/business', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          timezone: timezone.trim(),
          settings: {
            collectionsEnabled,
            agingSchedule,
            customAgingDays: parsedCustomDays.length > 0 ? parsedCustomDays : [30, 60, 90],
          },
        }),
      });

      setFeedback({
        type: 'success',
        message: 'Business settings and aging schedule updated successfully!',
      });
      await refreshUser();
      loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update business settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await apiFetch('/business/invite', {
        method: 'POST',
        body: JSON.stringify({
          phone: invitePhone.trim(),
          fullName: inviteName.trim(),
          role: inviteRole,
        }),
      });

      setFeedback({ type: 'success', message: 'Staff member added to business successfully!' });
      setInviteOpen(false);
      setInvitePhone('');
      setInviteName('');
      loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to invite user' });
    }
  };

  // Preview the aging buckets based on the active schedule
  const getBracketsPreview = () => {
    if (agingSchedule === 'fast') {
      return ['Current (0d)', '1-5d', '6-10d', '11-20d', '21-30d', '31+d'];
    }
    if (agingSchedule === 'biweekly') {
      return ['Current (0d)', '1-15d', '16-30d', '31-45d', '46-60d', '61+d'];
    }
    if (agingSchedule === 'custom') {
      const days = customAgingDays
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);
      if (days.length === 0) return ['Current (0d)', '1-30d', '31-60d', '61-90d', '91+d'];
      const res = ['Current (0d)'];
      let prev = 0;
      for (const d of days) {
        res.push(`${prev + 1}-${d}d`);
        prev = d;
      }
      res.push(`${prev + 1}+d`);
      return res;
    }
    return ['Current (0d)', '1-30d', '31-60d', '61-90d', '91+d'];
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
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

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Business Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure business profile, aging schedule brackets, feature modules, and team
          memberships.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Business Profile */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Business Details</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Primary corporate identity and reporting localization.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Business Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Business Code</label>
                <Input value={profile?.code || ''} disabled className="mt-1 bg-slate-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                <Input
                  value={`${profile?.currency || 'RWF'} (Rwandan Franc)`}
                  disabled
                  className="mt-1 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Timezone</label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AGING SCHEDULE CONFIGURATION */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <CardTitle className="text-base font-semibold">
                  A/R Aging Schedule Configuration
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Choose how overdue invoices are bucketed in reports and aging analytics.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Standard */}
              <div
                onClick={() => setAgingSchedule('standard')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  agingSchedule === 'standard'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">
                    Standard 30-Day Intervals
                  </span>
                  {agingSchedule === 'standard' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Brackets: 0-30, 31-60, 61-90, 91+ days overdue. Ideal for wholesale, B2B trade,
                  and corporate billing.
                </p>
              </div>

              {/* Fast Turnover */}
              <div
                onClick={() => setAgingSchedule('fast')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  agingSchedule === 'fast'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">
                    Fast Turnover (5-10 Days)
                  </span>
                  {agingSchedule === 'fast' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Brackets: 0-5, 6-10, 11-20, 21-30, 31+ days overdue. Ideal for FMCG, perishable
                  goods, and high-frequency trade.
                </p>
              </div>

              {/* Bi-Weekly */}
              <div
                onClick={() => setAgingSchedule('biweekly')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  agingSchedule === 'biweekly'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">
                    Bi-Weekly (15-Day Intervals)
                  </span>
                  {agingSchedule === 'biweekly' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Brackets: 0-15, 16-30, 31-45, 46-60, 61+ days overdue. Great for semi-monthly
                  retail and service contracts.
                </p>
              </div>

              {/* Custom */}
              <div
                onClick={() => setAgingSchedule('custom')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  agingSchedule === 'custom'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">Custom Intervals</span>
                  {agingSchedule === 'custom' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Define your own custom aging cutoff days (e.g. 15, 30, 45, 60 or 7, 14, 21, 28).
                </p>
              </div>
            </div>

            {/* Custom Days Input */}
            {agingSchedule === 'custom' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 animate-in fade-in-50">
                <label className="text-xs font-semibold text-slate-700">
                  Custom Aging Days (comma-separated, ascending)
                </label>
                <Input
                  value={customAgingDays}
                  onChange={(e) => setCustomAgingDays(e.target.value)}
                  placeholder="e.g. 15, 30, 45, 60"
                  className="bg-white"
                />
                <span className="text-[11px] text-slate-500">
                  Enter day cutoffs separated by commas. The system will automatically build
                  brackets up to and beyond your last day.
                </span>
              </div>
            )}

            {/* Live Brackets Preview */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Active Aging Brackets Preview:
              </span>
              <div className="flex flex-wrap gap-2">
                {getBracketsPreview().map((b, idx) => (
                  <Badge
                    key={idx}
                    variant={idx === 0 ? 'default' : 'secondary'}
                    className="text-xs font-mono py-1 px-2.5"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FEATURE MODULES (COLLECTIONS & FOLLOW-UPS) */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base font-semibold">Feature Modules</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Toggle optional business modules and tracking workflows.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">
                    Collections & Follow-Up Tracking
                  </span>
                  <Badge variant={collectionsEnabled ? 'success' : 'secondary'}>
                    {collectionsEnabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Enables debtor worklists, communication logging (calls, visits, letters), payment
                  promise tracking, scheduled follow-up tasks, and recovery metrics.
                </p>
              </div>
              <Button
                type="button"
                variant={collectionsEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCollectionsEnabled(!collectionsEnabled)}
                className={`gap-2 shrink-0 ${
                  collectionsEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-slate-700'
                }`}
              >
                {collectionsEnabled ? (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                    <span>Disabled</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Team Members & Roles */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Team Members & Roles</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Staff authorized to access this business workspace.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFeedback(null);
                setInviteOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {profile?.members?.map((m: any) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.fullName}</p>
                  <p className="text-xs text-slate-500">{m.phone}</p>
                </div>
                <Badge variant={m.role === 'BUSINESS_OWNER' ? 'default' : 'secondary'}>
                  {m.role?.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* INVITE USER MODAL */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
            <DialogDescription>
              Assign a staff member or accountant to this business workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input
                placeholder="e.g. Eric Manzi"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number (E.164)</label>
              <Input
                placeholder="+250 788 000 000"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Assign Role *
              </label>
              <SearchableSelect
                options={[
                  {
                    value: 'ACCOUNTANT',
                    label: 'Accountant',
                    subLabel: 'Record payments, issue receivables, manage ledgers',
                  },
                  {
                    value: 'MANAGER',
                    label: 'Manager',
                    subLabel: 'Supervise team, view reports, follow-up on collections',
                  },
                  {
                    value: 'BUSINESS_OWNER',
                    label: 'Business Owner',
                    subLabel: 'Full administrator access to business settings and staff',
                  },
                ]}
                value={inviteRole}
                onChange={setInviteRole}
                placeholder="Select role..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Team Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
