import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@receivables/ui';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Receivables', path: '/receivables', icon: Receipt },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Collections', path: '/collections', icon: PhoneCall },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            R
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 leading-none">
              Receivables
            </h1>
            <p className="text-xs text-slate-500 mt-1">Management Platform</p>
          </div>
        </div>

        {/* Business Selector */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">Kigali Trading Co.</p>
                <p className="text-[10px] text-slate-500">RWF (Default)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
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
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-medium text-xs text-slate-700">
              JD
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate">Justin Ishimwe</p>
              <p className="text-[11px] text-slate-500">+250 788 123 456</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase">
            Owner
          </Badge>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Business Workspace:</span>
            <span className="text-sm font-semibold text-slate-800">Kigali Trading Co.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
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
