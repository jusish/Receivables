import React, { useState, useEffect } from 'react';
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
import { History, Search, ShieldCheck } from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminAuditPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadAudit = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await adminApiFetch(`/admin/audit${query}`);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" />
          <span>Platform Audit Trail</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Immutable forensic log of financial mutations, status transitions, and user actions.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          <strong>Cryptographic Audit Immutability:</strong> All receivable adjustments, activations,
          payments, and membership invitations are recorded with correlation IDs and cannot be deleted.
        </span>
      </div>

      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by action, entity or reason..."
              className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Entity</TableHead>
                <TableHead className="text-slate-400">Actor</TableHead>
                <TableHead className="text-slate-400">Tenant</TableHead>
                <TableHead className="text-slate-400">Reason / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading audit trail records...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No matching audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((evt) => (
                  <TableRow key={evt.id} className="border-slate-800 hover:bg-slate-900/50">
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-semibold"
                      >
                        {evt.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-medium">
                      {evt.entityType}
                    </TableCell>
                    <TableCell className="text-xs text-white">{evt.actor}</TableCell>
                    <TableCell className="text-xs text-slate-400">{evt.business}</TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-sm truncate">
                      {evt.reason}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
