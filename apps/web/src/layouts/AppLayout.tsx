import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  PhoneCall,
  BarChart3,
  Settings,
  Building2,
  Bell,
  LogOut,
  Plus,
  History,
} from 'lucide-react';
import {
  Badge,
  Button,
  SearchableSelect,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  BrandLogo,
} from '@receivables/ui';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Receivables', path: '/receivables', icon: Receipt },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Collections', path: '/collections', icon: PhoneCall },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Audit Trail', path: '/audit', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, business, businesses, role, logout, switchBusiness, createBusiness } = useAuth();

  const [createBizOpen, setCreateBizOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCurrency, setNewBizCurrency] = useState('RWF');
  const [newBizTimezone, setNewBizTimezone] = useState('Africa/Kigali');
  const [creatingBiz, setCreatingBiz] = useState(false);
  const [bizError, setBizError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizError('');
    setCreatingBiz(true);
    try {
      await createBusiness({
        name: newBizName.trim(),
        currency: newBizCurrency,
        timezone: newBizTimezone,
      });
      setCreateBizOpen(false);
      setNewBizName('');
    } catch (err: any) {
      setBizError(err.message || 'Failed to create business workspace');
    } finally {
      setCreatingBiz(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const isCollectionsEnabled = business?.settings?.collectionsEnabled !== false;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <BrandLogo size="sm" title="Receivables" subtitle="Financial Platform" />
        </div>

        {/* Business Workspace Selector with multi-tenant SearchableSelect */}
        <div className="p-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {business?.name || 'My Business'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {business?.currency || 'RWF'} • {business?.code || 'BIZ'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                Active
              </Badge>
            </div>

            {/* Workspace Switcher using SearchableSelect */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Switch Workspace
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBizError('');
                    setCreateBizOpen(true);
                  }}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <SearchableSelect
                options={businesses.map((b) => ({
                  value: b.id,
                  label: b.name,
                  subLabel: `${b.currency || 'RWF'} • ${b.code || 'BIZ'}`,
                  badge: b.role ? b.role.replace('_', ' ') : undefined,
                }))}
                value={business?.id || ''}
                onChange={(targetId) => {
                  if (targetId && targetId !== business?.id) {
                    switchBusiness(targetId);
                  }
                }}
                placeholder="Switch workspace..."
                searchPlaceholder="Search your businesses..."
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            const isCollectionsItem = item.label === 'Collections';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isCollectionsItem && !isCollectionsEnabled && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                    Disabled
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer with working sign out */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {getInitials(user?.fullName)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.phone}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              {role ? role.replace('_', ' ') : 'Staff'}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Business Workspace:</span>
            <span className="text-sm font-semibold text-slate-800">
              {business?.name || 'Kigali Trading Co.'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              {business?.currency || 'RWF'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>
          </div>
        </header>

        {/* Page Content - dynamic key ensures instant refresh on workspace switch */}
        <main key={business?.id || 'default'} className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Create New Business Workspace Modal */}
      <Dialog open={createBizOpen} onOpenChange={setCreateBizOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Business Workspace</DialogTitle>
            <DialogDescription>
              Launch a new business entity that you will manage as Owner.
            </DialogDescription>
          </DialogHeader>

          {bizError && (
            <div className="p-3 rounded-md bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {bizError}
            </div>
          )}

          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Business / Company Name *</label>
              <Input
                placeholder="e.g. Kigali Wholesale Ltd"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Currency *</label>
                <SearchableSelect
                  options={[
                    { value: 'RWF', label: 'RWF (Rwandan Franc)' },
                    { value: 'USD', label: 'USD (US Dollar)' },
                    { value: 'KES', label: 'KES (Kenyan Shilling)' },
                    { value: 'UGX', label: 'UGX (Ugandan Shilling)' },
                    { value: 'EUR', label: 'EUR (Euro)' },
                  ]}
                  value={newBizCurrency}
                  onChange={setNewBizCurrency}
                  placeholder="Select currency..."
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Timezone *</label>
                <SearchableSelect
                  options={[
                    { value: 'Africa/Kigali', label: 'Africa/Kigali (CAT UTC+2)' },
                    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT UTC+3)' },
                    { value: 'UTC', label: 'UTC (Universal Coordinated)' },
                  ]}
                  value={newBizTimezone}
                  onChange={setNewBizTimezone}
                  placeholder="Select timezone..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateBizOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingBiz}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {creatingBiz ? 'Creating...' : 'Create & Switch Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
