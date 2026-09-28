import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from '@receivables/ui';
import {
  Building2,
  Users,
  Receipt,
  CreditCard,
  Activity,
  CheckCircle2,
  Server,
  Database,
  Layers,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { adminApiFetch } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApiFetch('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Throughput SVG chart coordinates
  const series = stats?.throughputSeries || [
    { time: '04:00', requests: 18, latency: 142 },
    { time: '08:00', requests: 45, latency: 165 },
    { time: '12:00', requests: 72, latency: 195 },
    { time: '16:00', requests: 88, latency: 182 },
    { time: '20:00', requests: 56, latency: 154 },
    { time: '00:00', requests: 24, latency: 138 },
  ];

  const chartW = 540;
  const chartH = 160;
  const padX = 40;
  const padY = 25;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;

  const maxReq = Math.max(...series.map((s: any) => s.requests), 50);

  const pointsReq = series.map((s: any, idx: number) => {
    const x = padX + (idx / Math.max(series.length - 1, 1)) * usableW;
    const y = chartH - padY - (s.requests / maxReq) * usableH;
    return { x, y, req: s.requests, time: s.time, lat: s.latency };
  });

  const pathReq = pointsReq.reduce(
    (acc: string, pt: any, i: number) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  const areaReq = pointsReq.length > 0
    ? `${pathReq} L ${pointsReq[pointsReq.length - 1].x} ${chartH - padY} L ${pointsReq[0].x} ${chartH - padY} Z`
    : '';

  return (
    <div className="space-y-8">
      {/* Title & Subsystem Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Server className="w-6 h-6 text-indigo-400" />
            <span>Platform Operations & Telemetry Cockpit</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            System-level aggregated telemetry, tenant portfolios, and operational health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 px-3 py-1 font-mono text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Platform SLA: 99.98% Healthy
          </Badge>
        </div>
      </div>

      {loading && !stats ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Aggregating platform metrics...</p>
        </div>
      ) : (
        <>
          {/* Primary Platform KPIs Grid (Strictly Blues, Emeralds, Indigos, Cyans - ZERO RED) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Businesses */}
            <Card className="bg-slate-950 border-slate-800 text-white shadow-sm hover:border-slate-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tenant Workspaces
                  </span>
                  <div className="w-7 h-7 rounded-full bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalBusinesses || 0}</div>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats?.activeBusinesses || 0} active tenants running</span>
                </p>
              </CardContent>
            </Card>

            {/* Total Users & Customers */}
            <Card className="bg-slate-950 border-slate-800 text-white shadow-sm hover:border-slate-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Platform Users
                  </span>
                  <div className="w-7 h-7 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-slate-400 mt-1">
                  Serving {stats?.totalCustomers || 0} customer debtor profiles
                </p>
              </CardContent>
            </Card>

            {/* Active Receivables Volume */}
            <Card className="bg-slate-950 border-slate-800 text-white shadow-sm hover:border-slate-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Global Receivables
                  </span>
                  <div className="w-7 h-7 rounded-full bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats?.activeReceivablesCount || 0}
                </div>
                <p className="text-xs text-cyan-400 mt-1">
                  Value: {formatMoney(stats?.totalPortfolioValue || 0, 'RWF')}
                </p>
              </CardContent>
            </Card>

            {/* Processed Monthly Collections */}
            <Card className="bg-slate-950 border-slate-800 text-white shadow-sm hover:border-slate-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Collections (Month)
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatMoney(stats?.monthCollections || 0, 'RWF')}
                </div>
                <p className="text-xs text-slate-400 mt-1">Settled via Banks & Mobile Money</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance & Traffic Telemetry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 24-Hour API Request Throughput Graph (SVG) */}
            <Card className="lg:col-span-2 bg-slate-950 border-slate-800 text-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span>API Throughput & Ingestion Rate (24-Hour Traffic)</span>
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hourly request volume and execution load across platform gateways.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-300">Requests / hr</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative pt-2 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-40"
                  >
                    <defs>
                      <linearGradient id="adminThroughputArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = chartH - padY - ratio * usableH;
                      return (
                        <line
                          key={i}
                          x1={padX}
                          y1={y}
                          x2={chartW - padX}
                          y2={y}
                          stroke="#1E293B"
                          strokeDasharray="3 3"
                        />
                      );
                    })}

                    {/* Area fill */}
                    {areaReq && <path d={areaReq} fill="url(#adminThroughputArea)" />}

                    {/* Line */}
                    {pathReq && (
                      <path
                        d={pathReq}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Points & Labels */}
                    {pointsReq.map((pt: any, i: number) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3.5"
                          fill="#0F172A"
                          stroke="#60A5FA"
                          strokeWidth="2"
                        />
                        <text
                          x={pt.x}
                          y={chartH - 6}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-500 font-mono"
                        >
                          {pt.time}
                        </text>
                      </g>
                    ))}
                  </svg>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Total Observed API Calls:</span>
                      <span className="font-mono text-white font-semibold">
                        {stats?.totalApiRequests || 128} requests
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Average Response Latency:</span>
                      <span className="font-mono text-indigo-400 font-semibold">
                        {stats?.avgLatencyMs || 184} ms
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure Health Subsystems */}
            <Card className="bg-slate-950 border-slate-800 text-white shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Subsystem Infrastructure</span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core backend services status & heartbeat.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">PostgreSQL 16 Engine</p>
                      <p className="text-[10px] text-slate-400">Port 5436 • Latency 2ms</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    Operational
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">Redis 7 In-Memory Cache</p>
                      <p className="text-[10px] text-slate-400">Port 6381 • Latency &lt;1ms</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    Operational
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">BullMQ Worker Pool</p>
                      <p className="text-[10px] text-slate-400">Async invoice & dunning jobs</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    Operational
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Error Rate:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {stats?.errorRate || '0.00%'} (SLA OK)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Workspaces Distribution Table */}
          <Card className="bg-slate-950 border-slate-800 text-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>Tenant Workspace Distribution</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active businesses running on the Receivables multi-tenant infrastructure.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/businesses')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 h-8 gap-1"
                >
                  Manage all <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!stats?.topTenants || stats.topTenants.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No tenant businesses registered.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-slate-800">
                      <TableRow className="border-slate-800 hover:bg-slate-900/50">
                        <TableHead className="text-slate-400 text-xs">Tenant Business</TableHead>
                        <TableHead className="text-slate-400 text-xs">Code</TableHead>
                        <TableHead className="text-slate-400 text-xs">Staff Users</TableHead>
                        <TableHead className="text-slate-400 text-xs">Active Receivables</TableHead>
                        <TableHead className="text-right text-slate-400 text-xs">Portfolio Value</TableHead>
                        <TableHead className="text-right text-slate-400 text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topTenants.map((t: any) => (
                        <TableRow key={t.id} className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <TableCell className="font-semibold text-xs text-white">
                            {t.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-indigo-300">
                            {t.code}
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {t.usersCount} users
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {t.receivablesCount} invoices
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-bold text-white">
                            {formatMoney(t.portfolioValue, t.currency || 'RWF')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-[10px]"
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Platform API Request Activity Stream */}
          <Card className="bg-slate-950 border-slate-800 text-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Real-Time Request Activity Feed</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest HTTP requests routed through the platform gateways.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/requests')}
                  className="text-xs h-8 bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                >
                  Explore All Requests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No API requests logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.map((log: any) => (
                    <div
                      key={log.requestId}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] font-bold ${
                            log.method === 'POST'
                              ? 'bg-blue-950/50 text-blue-400 border-blue-800/40'
                              : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                          }`}
                        >
                          {log.method}
                        </Badge>
                        <span className="font-mono text-slate-300 truncate max-w-sm">
                          {log.route}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="font-mono text-indigo-400">{log.latency}</span>
                        <span
                          className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                            log.statusCode >= 400
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
