import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop collapsible state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('web_sidebar_collapsed') === 'true';
  });

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('web_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar: Slide-over drawer on mobile (< lg), Collapsible on desktop (>= lg) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Brand & Mobile Close / Desktop Toggle Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-hidden">
            {isCollapsed ? (
              <div className="w-full flex justify-center">
                <BrandLogo size="sm" showText={false} />
              </div>
            ) : (
              <BrandLogo size="sm" title="Receivables" subtitle="Financial Platform" />
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Workspace Selector */}
        {!isCollapsed ? (
          <div className="p-3 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
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
              <div className="pt-0.5 space-y-1">
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
        ) : (
          <div className="p-2 border-b border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={toggleDesktopCollapse}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title={`Active: ${business?.name || 'Workspace'}`}
            >
              <Building2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && isCollectionsItem && !isCollectionsEnabled && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                    Disabled
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer with working sign out */}
        <div className={`p-3 border-t border-slate-100 ${isCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-3'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(user?.fullName)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.phone}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[9px] uppercase font-semibold">
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
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs"
                title={`${user?.fullName} (${user?.phone})`}
              >
                {getInitials(user?.fullName)}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleDesktopCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Workspace Information Badge (Responsive truncation) */}
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs sm:text-sm font-medium text-slate-400 hidden sm:inline">
                Workspace:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[130px] sm:max-w-[220px] md:max-w-xs">
                {business?.name || 'Kigali Trading Co.'}
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                {business?.currency || 'RWF'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {/* Compact user chip on mobile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {getInitials(user?.fullName)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content: responsive padding (p-4 on phones, p-6 on tablets, p-8 on desktop) */}
        <main
          key={business?.id || 'default'}
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden"
        >
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
