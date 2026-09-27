import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from '@receivables/ui';
import { Search, ShieldAlert } from 'lucide-react';

const sampleRequests = [
  {
    requestId: 'req_88291a2b',
    method: 'POST',
    route: '/api/v1/payments',
    statusCode: 201,
    latency: '182ms',
    business: 'Kigali Trading Co.',
    user: 'Alice (Accountant)',
    ip: '197.243.12.8',
    timestamp: '2026-09-27 10:45:12',
  },
  {
    requestId: 'req_33104c9e',
    method: 'POST',
    route: '/api/v1/receivables',
    statusCode: 201,
    latency: '240ms',
    business: 'Kigali Trading Co.',
    user: 'Justin (Owner)',
    ip: '197.243.12.8',
    timestamp: '2026-09-27 10:42:01',
  },
  {
    requestId: 'req_9921f001',
    method: 'GET',
    route: '/api/v1/reports/ar-aging',
    statusCode: 200,
    latency: '310ms',
    business: 'Inzovu Supplies Ltd',
    user: 'David (Manager)',
    ip: '105.178.44.19',
    timestamp: '2026-09-27 10:39:55',
  },
  {
    requestId: 'req_7714e883',
    method: 'POST',
    route: '/api/v1/auth/login',
    statusCode: 401,
    latency: '95ms',
    business: '—',
    user: 'Anonymous',
    ip: '41.186.20.100',
    timestamp: '2026-09-27 10:35:10',
  },
];

export const AdminRequestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">API Request Explorer</h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed technical request logs with correlation IDs, latency tracking, and sanitized
          payloads.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Data Protection Notice:</strong> Request payloads are sanitized. Passwords,
          authorization headers, and sensitive PII are strictly redacted.
        </span>
      </div>

      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by Request ID, route or IP..."
              className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Request ID</TableHead>
                <TableHead className="text-slate-400">Method</TableHead>
                <TableHead className="text-slate-400">Route</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Latency</TableHead>
                <TableHead className="text-slate-400">Tenant</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRequests.map((req) => (
                <TableRow key={req.requestId} className="border-slate-800 hover:bg-slate-900/50">
                  <TableCell className="font-mono text-xs text-indigo-400 font-medium">
                    {req.requestId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={req.method === 'POST' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {req.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">{req.route}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.statusCode < 300
                          ? 'success'
                          : req.statusCode < 500
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {req.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{req.latency}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{req.business}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{req.user}</TableCell>
                  <TableCell className="text-slate-500 text-xs">{req.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
