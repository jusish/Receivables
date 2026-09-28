import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@receivables/ui';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  PhoneCall,
  PlusCircle,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Users,
  ChevronRight,
  Receipt,
  PieChart,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';
import { downloadAgingSchedulePdf } from '../../lib/pdf-export';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/dashboard/metrics');
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      setExportNotice(null);
      const agingData = await apiFetch('/reports/ar-aging');
      downloadAgingSchedulePdf(agingData, 'Receivables Portfolio');
      setExportNotice('Aging Schedule PDF downloaded directly to your computer.');
    } catch (err: any) {
      setExportNotice(`Failed to export PDF: ${err.message || 'Error'}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Aggregating workspace financial performance...</p>
      </div>
    );
  }

  // Aging distribution calculation for visual progress bar
  const agingTotal =
    (metrics?.aging?.current?.amount || 0) +
    (metrics?.aging?.days1_30?.amount || 0) +
    (metrics?.aging?.days31_60?.amount || 0) +
    (metrics?.aging?.days61_90?.amount || 0) +
    (metrics?.aging?.days91Plus?.amount || 0);

  const getAgingPercent = (amount: number) => {
    if (!agingTotal || agingTotal === 0) return 0;
    return Math.max(0, Math.round((amount / agingTotal) * 100));
  };

  // Cash Flow Trend SVG coordinates calculation
  const trendData = metrics?.cashFlowTrend || [];
  const maxVal = Math.max(
    ...trendData.map((d: any) => Math.max(d.billed || 0, d.collected || 0)),
    1000000
  );

  const chartWidth = 540;
  const chartHeight = 170;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const pointsBilled = trendData.map((d: any, idx: number) => {
    const x = paddingX + (idx / Math.max(trendData.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingY - ((d.billed || 0) / maxVal) * usableHeight;
    return { x, y, val: d.billed, label: d.month };
  });

  const pointsCollected = trendData.map((d: any, idx: number) => {
    const x = paddingX + (idx / Math.max(trendData.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingY - ((d.collected || 0) / maxVal) * usableHeight;
    return { x, y, val: d.collected, label: d.month };
  });

  const pathBilled = pointsBilled.length > 0
    ? pointsBilled.reduce((acc: string, pt: any, i: number) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  const pathCollected = pointsCollected.length > 0
    ? pointsCollected.reduce((acc: string, pt: any, i: number) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  const areaCollected = pointsCollected.length > 0
    ? `${pathCollected} L ${pointsCollected[pointsCollected.length - 1].x} ${chartHeight - paddingY} L ${pointsCollected[0].x} ${chartHeight - paddingY} Z`
    : '';

  const realizationRate =
    metrics?.totalOutstanding + metrics?.collectedThisMonth > 0
      ? Math.round(
          (metrics.collectedThisMonth / (metrics.totalOutstanding + metrics.collectedThisMonth)) * 100
        )
      : 0;

  return (
    <div className="space-y-8">
      {exportNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-xs font-semibold hover:underline text-emerald-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Financial Operations Dashboard</span>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-semibold text-xs">
              Live Workspace
            </Badge>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Accounts receivable portfolio status, collections velocity, and maturing obligations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={exporting}
            className="gap-2 text-xs h-9 border-slate-200 hover:bg-slate-100"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            {exporting ? 'Generating...' : 'Export Aging Schedule'}
          </Button>
          <Button
            onClick={() => navigate('/receivables')}
            className="gap-2 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Receivable
          </Button>
        </div>
      </div>

      {/* 5 Core Metric Cards (Strictly Blues, Greens, Cyans, Indigos & Slates - NO RED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Outstanding */}
        <Card className="border-slate-200 hover:border-blue-300 transition-all shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Outstanding
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">
              {formatMoney(metrics?.totalOutstanding || 0, 'RWF')}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
              <span>{metrics?.activeReceivablesCount || 0} active receivables</span>
            </p>
          </CardContent>
        </Card>

        {/* Collected This Month */}
        <Card className="border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 transition-all shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Collected (Month)
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-950">
              {formatMoney(metrics?.collectedThisMonth || 0, 'RWF')}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{metrics?.paymentsCountMonth || 0} receipts deposited</span>
            </p>
          </CardContent>
        </Card>

        {/* Due in 7 Days */}
        <Card className="border-sky-200 bg-sky-50/20 hover:border-sky-300 transition-all shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
                Due in 7 Days
              </span>
              <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-sky-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-sky-950">
              {formatMoney(metrics?.dueIn7Days || 0, 'RWF')}
            </div>
            <p className="text-xs text-sky-700 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{metrics?.dueIn7DaysCount || 0} invoices maturing</span>
            </p>
          </CardContent>
        </Card>

        {/* Overdue Balance (Strictly Slate/Indigo - NO RED) */}
        <Card className="border-indigo-200 bg-indigo-50/20 hover:border-indigo-300 transition-all shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
                Overdue Portfolio
              </span>
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-950">
              {formatMoney(metrics?.overdueBalance || 0, 'RWF')}
            </div>
            <p className="text-xs text-indigo-700 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Targeted for dunning follow-up</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card className="border-cyan-200 bg-cyan-50/20 hover:border-cyan-300 transition-all shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                Scheduled Follow-Ups
              </span>
              <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center">
                <PhoneCall className="w-4 h-4 text-cyan-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-cyan-950">
              {metrics?.followUpsDueCount || 0} Customers
            </div>
            <p className="text-xs text-cyan-700 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>Active collection queues</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Grid: Cash Flow Trend & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 6-Month Cash Flow Trend (Billed vs Collected) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Cash Flow Velocity & Inflows (6-Month Trend)</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison between newly billed receivables and cash collected.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-blue-600" />
                  <span className="text-slate-600 font-medium">Billed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Collected</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No billing history recorded yet for this workspace.
              </div>
            ) : (
              <div className="relative pt-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-44 overflow-visible"
                >
                  <defs>
                    <linearGradient id="collectedArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = chartHeight - paddingY - ratio * usableHeight;
                    return (
                      <g key={i}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeDasharray="3 3"
                        />
                      </g>
                    );
                  })}

                  {/* Collected Area fill */}
                  {areaCollected && (
                    <path d={areaCollected} fill="url(#collectedArea)" />
                  )}

                  {/* Billed Line (Blue) */}
                  {pathBilled && (
                    <path
                      d={pathBilled}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Collected Line (Emerald) */}
                  {pathCollected && (
                    <path
                      d={pathCollected}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Datapoint circles & X-axis labels */}
                  {pointsBilled.map((pt: any, i: number) => (
                    <g key={`billed-${i}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth="2"
                      />
                      <text
                        x={pt.x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-medium"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}

                  {pointsCollected.map((pt: any, i: number) => (
                    <circle
                      key={`coll-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke="#059669"
                      strokeWidth="2"
                    />
                  ))}
                </svg>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Portfolio Realization:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                      {realizationRate}% Realized
                    </span>
                  </div>
                  <span>Currency: RWF (Rwanda Francs)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Payment Channels & Settlement Methods */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Settlement Channels</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of customer payments received by medium.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(!metrics?.paymentMethods || metrics.paymentMethods.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No payment transactions recorded yet.
              </div>
            ) : (
              metrics.paymentMethods.map((m: any) => (
                <div key={m.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{m.label}</span>
                    <span className="font-bold text-slate-900">
                      {formatMoney(m.amount, 'RWF')}{' '}
                      <span className="text-[11px] font-normal text-slate-400">
                        ({m.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.method === 'BANK_TRANSFER'
                          ? 'bg-blue-600'
                          : m.method === 'MOBILE_MONEY'
                          ? 'bg-emerald-600'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Fast-settlement methods:</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                Instant Clearing
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/R Aging Schedule Continuous Distribution Bar & Cards */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>A/R Aging Schedule Breakdown</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Outstanding balances partitioned into aging maturity brackets as of today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-slate-50">
                Total Tracked: {formatMoney(agingTotal, 'RWF')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Continuous Proportional Aging Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${getAgingPercent(metrics?.aging?.current?.amount || 0)}%` }}
              title={`Current: ${getAgingPercent(metrics?.aging?.current?.amount || 0)}%`}
            />
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${getAgingPercent(metrics?.aging?.days1_30?.amount || 0)}%` }}
              title={`1-30 Days: ${getAgingPercent(metrics?.aging?.days1_30?.amount || 0)}%`}
            />
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${getAgingPercent(metrics?.aging?.days31_60?.amount || 0)}%` }}
              title={`31-60 Days: ${getAgingPercent(metrics?.aging?.days31_60?.amount || 0)}%`}
            />
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${getAgingPercent(metrics?.aging?.days61_90?.amount || 0)}%` }}
              title={`61-90 Days: ${getAgingPercent(metrics?.aging?.days61_90?.amount || 0)}%`}
            />
            <div
              className="h-full bg-slate-600 transition-all"
              style={{ width: `${getAgingPercent(metrics?.aging?.days91Plus?.amount || 0)}%` }}
              title={`91+ Days: ${getAgingPercent(metrics?.aging?.days91Plus?.amount || 0)}%`}
            />
          </div>

          {/* 5 Bracket Cards (Strictly Emerald -> Cyan -> Sky -> Indigo -> Slate - ZERO RED) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {/* Current */}
            <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800">Current (Not Due)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-base font-bold text-emerald-950 mt-1">
                {formatMoney(metrics?.aging?.current?.amount || 0, 'RWF')}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {metrics?.aging?.current?.count || 0} receivables ({getAgingPercent(metrics?.aging?.current?.amount || 0)}%)
              </p>
            </div>

            {/* 1 - 30 Days */}
            <div className="p-3.5 rounded-lg bg-cyan-50/40 border border-cyan-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-800">1 - 30 Days</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
              </div>
              <p className="text-base font-bold text-cyan-950 mt-1">
                {formatMoney(metrics?.aging?.days1_30?.amount || 0, 'RWF')}
              </p>
              <p className="text-[11px] text-cyan-700 mt-0.5">
                {metrics?.aging?.days1_30?.count || 0} receivables ({getAgingPercent(metrics?.aging?.days1_30?.amount || 0)}%)
              </p>
            </div>

            {/* 31 - 60 Days */}
            <div className="p-3.5 rounded-lg bg-sky-50/40 border border-sky-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sky-800">31 - 60 Days</span>
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
              <p className="text-base font-bold text-sky-950 mt-1">
                {formatMoney(metrics?.aging?.days31_60?.amount || 0, 'RWF')}
              </p>
              <p className="text-[11px] text-sky-700 mt-0.5">
                {metrics?.aging?.days31_60?.count || 0} receivables ({getAgingPercent(metrics?.aging?.days31_60?.amount || 0)}%)
              </p>
            </div>

            {/* 61 - 90 Days */}
            <div className="p-3.5 rounded-lg bg-indigo-50/40 border border-indigo-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-800">61 - 90 Days</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <p className="text-base font-bold text-indigo-950 mt-1">
                {formatMoney(metrics?.aging?.days61_90?.amount || 0, 'RWF')}
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                {metrics?.aging?.days61_90?.count || 0} receivables ({getAgingPercent(metrics?.aging?.days61_90?.amount || 0)}%)
              </p>
            </div>

            {/* 91+ Days */}
            <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800">91+ Days</span>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              <p className="text-base font-bold text-slate-900 mt-1">
                {formatMoney(metrics?.aging?.days91Plus?.amount || 0, 'RWF')}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {metrics?.aging?.days91Plus?.count || 0} critical ({getAgingPercent(metrics?.aging?.days91Plus?.amount || 0)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Data Tables Grid: Upcoming Due Receivables & Top Debtors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Upcoming Due Invoices (Next 14-30 Days) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Maturing Invoices (Next 30 Days)</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receivables approaching due dates requiring collection prep.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/receivables')}
                className="text-xs text-blue-600 hover:text-blue-800 h-8 gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(!metrics?.upcomingDue || metrics.upcomingDue.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No receivables due in the next 30 days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-xs font-semibold text-slate-700">Invoice</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Customer</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Due Date</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-700">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.upcomingDue.map((inv: any) => (
                      <TableRow key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-blue-600">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-slate-800">{inv.customerName}</div>
                          <div className="text-[10px] text-slate-400">{inv.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-700">{inv.dueDate}</div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            {inv.daysLeft === 0 ? 'Due Today' : `in ${inv.daysLeft} days`}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-slate-900">
                          {formatMoney(inv.outstandingBalance, 'RWF')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table 2: Top Customer Debtors */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Top Outstanding Debtors</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customers with highest outstanding accounts receivable balances.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customers')}
                className="text-xs text-blue-600 hover:text-blue-800 h-8 gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(!metrics?.topDebtors || metrics.topDebtors.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No customer debtors with outstanding balances.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-xs font-semibold text-slate-700">Customer</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700">Open Invoices</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-700">Outstanding</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.topDebtors.map((deb: any) => (
                      <TableRow key={deb.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-800">{deb.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{deb.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] bg-slate-50 border-slate-200">
                            {deb.invoicesCount} open
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-slate-900">
                          {formatMoney(deb.totalOutstanding, 'RWF')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/collections')}
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            Follow Up <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Collections Activity & Follow-Up Notes Stream */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Recent Collection & Recovery Activities</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time collection calls, promises to pay, and customer communications.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/collections')}
              className="text-xs h-8 border-slate-200"
            >
              Open Collections Queue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!metrics?.recentActivities || metrics.recentActivities.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent collection activities logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{act.customerName}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold"
                        >
                          {act.outcome.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mt-0.5 max-w-xl">{act.notes}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {act.promisedAmount && (
                      <div className="font-bold text-slate-900">
                        Promised: {formatMoney(act.promisedAmount, 'RWF')}
                      </div>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
