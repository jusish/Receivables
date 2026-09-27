import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  AlertOctagon,
  HeartPulse,
  History,
  Settings,
} from 'lucide-react';
import { Badge } from '@receivables/ui';

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

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              Admin Console
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">Platform Operations</p>
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

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Superadmin footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-400 truncate">admin@receivables.internal</p>
          </div>
          <Badge variant="warning" className="text-[10px] uppercase">
            Root
          </Badge>
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
