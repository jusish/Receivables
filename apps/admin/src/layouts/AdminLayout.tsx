import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  AlertOctagon,
  HeartPulse,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Badge, Button, BrandLogo } from '@receivables/ui';
import { useAdminAuth } from '../context/AdminAuthContext';

const navItems = [
  { label: 'System Overview', path: '/', icon: ShieldCheck },
  { label: 'Businesses', path: '/businesses', icon: Building2 },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'API Requests', path: '/requests', icon: Activity },
  { label: 'System Errors', path: '/errors', icon: AlertOctagon },
  { label: 'System Health', path: '/health', icon: HeartPulse },
  { label: 'Audit Trail', path: '/audit', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop collapsible state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar: Slide-over drawer on mobile (< lg), Collapsible on desktop (>= lg) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Brand & Mobile Close */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            {isCollapsed ? (
              <div className="w-full flex justify-center">
                <BrandLogo size="sm" showText={false} theme="dark" />
              </div>
            ) : (
              <BrandLogo size="sm" title="Admin Console" subtitle="Platform Operations" theme="dark" />
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                } rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Superadmin footer with working Sign Out */}
        <div className={`p-3 border-t border-slate-800 ${isCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-3'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {adminUser?.fullName || 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {adminUser?.phone || 'admin@receivables.internal'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase bg-indigo-950/60 border-indigo-500/30 text-indigo-300 font-bold"
                >
                  {adminUser?.adminRole || 'ROOT'}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-slate-800 justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800/40 text-indigo-300 flex items-center justify-center font-bold text-xs"
                title={`${adminUser?.fullName} (${adminUser?.adminRole || 'ROOT'})`}
              >
                {adminUser?.fullName?.slice(0, 2).toUpperCase() || 'SA'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-md"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-300 hover:bg-slate-800 lg:hidden focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleDesktopCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
                Environment:
              </span>
              <Badge
                variant="outline"
                className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] sm:text-xs"
              >
                Live Production
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Cluster: local-docker</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
          </div>
        </header>

        {/* Page Content: responsive padding (p-4 on phones, p-6 on tablets, p-8 on desktop) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
