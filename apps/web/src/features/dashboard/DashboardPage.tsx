import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@receivables/ui';
import {
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Accounts receivable performance, collection follow-ups and cash position overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Aging PDF
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="w-4 h-4" />
            New Receivable
          </Button>
        </div>
      </div>

      {/* 5 Core Metric Cards (Spec Section 35) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Total Outstanding
              </span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">{formatMoney(12450000, 'RWF')}</div>
            <p className="text-xs text-slate-500 mt-1">Across 42 active receivables</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-amber-700">
                Overdue Balance
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-900">{formatMoney(3200000, 'RWF')}</div>
            <p className="text-xs text-amber-600 mt-1">Requires active follow-up</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Due in 7 Days</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">{formatMoney(1850000, 'RWF')}</div>
            <p className="text-xs text-slate-500 mt-1">6 customer payments</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Collected Month
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-900">{formatMoney(8700000, 'RWF')}</div>
            <p className="text-xs text-emerald-600 mt-1">28 payments received</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-rose-700">Follow-Ups Due</span>
              <PhoneCall className="w-4 h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-900">23 Customers</div>
            <p className="text-xs text-rose-600 mt-1">Overdue or promised date</p>
          </CardContent>
        </Card>
      </div>

      {/* A/R Aging Summary Table (Spec Section 36) */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                A/R Aging Summary
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Receivables distributed by overdue aging brackets as of today.
              </p>
            </div>
            <Badge variant="outline">Currency: RWF</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500">Current (Not Due)</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{formatMoney(5200000, 'RWF')}</p>
              <p className="text-xs text-slate-400 mt-1">41.8% of portfolio</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
              <p className="text-xs font-medium text-amber-700">1 - 30 Days</p>
              <p className="text-lg font-bold text-amber-900 mt-1">{formatMoney(2100000, 'RWF')}</p>
              <p className="text-xs text-amber-600 mt-1">16.9%</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-100">
              <p className="text-xs font-medium text-orange-700">31 - 60 Days</p>
              <p className="text-lg font-bold text-orange-900 mt-1">
                {formatMoney(1300000, 'RWF')}
              </p>
              <p className="text-xs text-orange-600 mt-1">10.4%</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
              <p className="text-xs font-medium text-red-700">61 - 90 Days</p>
              <p className="text-lg font-bold text-red-900 mt-1">{formatMoney(800000, 'RWF')}</p>
              <p className="text-xs text-red-600 mt-1">6.4%</p>
            </div>
            <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100">
              <p className="text-xs font-medium text-rose-700">91+ Days</p>
              <p className="text-lg font-bold text-rose-900 mt-1">{formatMoney(600000, 'RWF')}</p>
              <p className="text-xs text-rose-600 mt-1">4.8% critical</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
