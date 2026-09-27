import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@receivables/ui';
import {
  Building2,
  Users,
  Receipt,
  CreditCard,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          System Operations Dashboard
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Platform-level aggregate metrics across all active business tenants.
        </p>
      </div>

      {/* Primary KPI Grid (Section 53 of specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-950 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Total Businesses
              </span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-emerald-400 mt-1">118 currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Total Platform Users
              </span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">843</div>
            <p className="text-xs text-slate-400 mt-1">Across 42,391 customers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Active Receivables
              </span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83,210</div>
            <p className="text-xs text-amber-400 mt-1">
              Total value: {formatMoney(1800000000, 'RWF')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Collections (Month)
              </span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(920000000, 'RWF')}</div>
            <p className="text-xs text-emerald-400 mt-1">Processed across banks & MoMo</p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Observability Metrics (Section 53 & 56) */}
      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white">
              API Infrastructure & Service Level
            </CardTitle>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              SLA: 99.97%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Daily API Requests</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-bold text-white mt-2">1.2M</p>
              <p className="text-xs text-slate-500 mt-1">~14 req/sec average</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Avg API Latency</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl font-bold text-white mt-2">183 ms</p>
              <p className="text-xs text-slate-500 mt-1">P95: 320ms | P99: 610ms</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Error Rate</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400 mt-2">0.31%</p>
              <p className="text-xs text-slate-500 mt-1">4xx: 0.28% | 5xx: 0.03%</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Availability</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400 mt-2">99.97%</p>
              <p className="text-xs text-slate-500 mt-1">Zero downtime in 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
