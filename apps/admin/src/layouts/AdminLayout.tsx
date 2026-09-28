import React from 'react';
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800">
          <BrandLogo size="sm" title="Admin Console" subtitle="Platform Operations" theme="dark" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Superadmin footer with working Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-3">
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
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Environment:
            </span>
            <Badge
              variant="outline"
              className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            >
              Live Development
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono">Cluster: local-docker</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
