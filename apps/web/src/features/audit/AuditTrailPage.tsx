import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Pagination,
} from '@receivables/ui';
import {
  History,
  Search,
  ShieldCheck,
  FileText,
  UserCheck,
  Activity,
  Info,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

export const AuditTrailPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadAudit = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await apiFetch(`/business/audit${query}`);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load workspace audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
    setCurrentPage(1);
  }, [search]);

  // Filter by category
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return events;
    return events.filter((e) => {
      const act = e.action || '';
      if (selectedCategory === 'PAYMENTS') return act.includes('PAYMENT');
      if (selectedCategory === 'RECEIVABLES') return act.includes('RECEIVABLE');
      if (selectedCategory === 'CUSTOMERS') return act.includes('CUSTOMER');
      if (selectedCategory === 'MEMBERSHIP') return act.includes('USER') || act.includes('MEMBER');
      return true;
    });
  }, [events, selectedCategory]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Statistics
  const financialEventsCount = events.filter(
    (e) => e.action?.includes('PAYMENT') || e.action?.includes('RECEIVABLE')
  ).length;
  const uniqueActorsCount = new Set(events.map((e) => e.actor)).size;

  const getActionBadge = (action: string) => {
    if (action.includes('PAYMENT')) {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 border-emerald-200 text-emerald-800 font-mono text-[10px] font-semibold"
        >
          {action}
        </Badge>
      );
    }
    if (action.includes('RECEIVABLE')) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 border-blue-200 text-blue-800 font-mono text-[10px] font-semibold"
        >
          {action}
        </Badge>
      );
    }
    if (action.includes('CUSTOMER')) {
      return (
        <Badge
          variant="outline"
          className="bg-cyan-50 border-cyan-200 text-cyan-800 font-mono text-[10px] font-semibold"
        >
          {action}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-indigo-50 border-indigo-200 text-indigo-800 font-mono text-[10px] font-semibold"
      >
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            <span>Workspace Audit Trail</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable forensic log of all financial records, status updates, and staff actions in this workspace.
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <span>
          <strong>Workspace-Isolated Audit Log:</strong> All events are cryptographically isolated
          to your business workspace. Transactions and status adjustments cannot be altered or purged.
        </span>
      </div>

      {/* Overview Stat Cards (Strictly Blue & Green & Indigo - No Red) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Total Workspace Events
              </span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{events.length}</div>
            <p className="text-xs text-slate-500 mt-1">Logged actions on record</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Financial Operations
              </span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{financialEventsCount}</div>
            <p className="text-xs text-emerald-600 mt-1">Receivables, payments & credits</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-indigo-700">
                Staff Actors
              </span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{uniqueActorsCount}</div>
            <p className="text-xs text-indigo-600 mt-1">Active users performing changes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search action, entity or reason..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'RECEIVABLES', label: 'Receivables' },
                { key: 'PAYMENTS', label: 'Payments' },
                { key: 'CUSTOMERS', label: 'Customers' },
                { key: 'MEMBERSHIP', label: 'Staff & Team' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[170px] text-xs font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Action</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Entity</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Actor</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700">Reason / Description</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-700">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading audit trail records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No audit events found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No actions match your current search or category filter.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((evt) => (
                  <TableRow key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>{getActionBadge(evt.action)}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      {evt.entityType}
                    </TableCell>
                    <TableCell className="text-xs text-slate-800">
                      <div>{evt.actor}</div>
                      {evt.actorPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{evt.actorPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {evt.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(evt)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Info className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredEvents.length > pageSize && (
            <div className="mt-4 pt-2 border-t border-slate-100">
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={filteredEvents.length}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forensic Details Dialog */}
      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Audit Event Forensic Details</span>
            </DialogTitle>
            <DialogDescription>
              Detailed record snapshot and metadata captured at event execution.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Action:</span>
                  <div className="mt-0.5">{getActionBadge(selectedEvent.action)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Timestamp:</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">
                    {new Date(selectedEvent.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Actor:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedEvent.actor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Entity:</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">
                    {selectedEvent.entityType} ({selectedEvent.entityId?.slice(0, 8)}...)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Reason / Note:</span>
                <div className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-800">
                  {selectedEvent.reason}
                </div>
              </div>

              {selectedEvent.afterData && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Captured Snapshot Data:
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedEvent.afterData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEvent.requestId && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Correlation Request ID:</span>
                  <span className="font-mono text-slate-600">{selectedEvent.requestId}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedEvent(null)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
