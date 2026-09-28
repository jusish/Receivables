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
  Button,
  Pagination,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@receivables/ui';
import {
  AlertOctagon,
  Search,
  ShieldAlert,
  Eye,
  Copy,
  Check,
  Clock,
  Globe,
  Building,
  User,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminErrorsPage: React.FC = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Detail Modal State
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const data = await adminApiFetch('/admin/errors');
      setErrors(data);
    } catch (err) {
      console.error('Failed to load error logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, []);

  const filteredErrors = errors.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.requestId?.toLowerCase().includes(q) ||
      e.route?.toLowerCase().includes(q) ||
      e.errorMessage?.toLowerCase().includes(q)
    );
  });

  const handleOpenDetail = (err: any) => {
    setSelectedError(err);
    setCopied(false);
    setModalOpen(true);
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startIndex = (page - 1) * pageSize;
  const paginatedErrors = filteredErrors.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-500" />
          <span>System Error Explorer</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed technical error logs capturing 4xx client errors and 5xx internal exceptions.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Automated Triage:</strong> Unhandled exceptions are automatically correlated with
          request headers and stored with redacted credentials.
        </span>
      </div>

      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by Request ID, route or error message..."
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="text-xs text-slate-400">
              Total Logged: <strong className="text-white">{filteredErrors.length}</strong>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                  <TableHead className="text-slate-400">Request ID</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Route</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Error Description</TableHead>
                  <TableHead className="text-slate-400">Client IP</TableHead>
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      Loading system error logs...
                    </TableCell>
                  </TableRow>
                ) : paginatedErrors.length === 0 ? (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      No matching error logs recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedErrors.map((err, i) => (
                    <TableRow key={err.requestId || i} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-mono text-xs text-rose-400 font-semibold">
                        {err.requestId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-slate-300">
                          {err.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300 max-w-[180px] truncate">
                        {err.route}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-[10px]">
                          HTTP {err.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-rose-300 max-w-sm truncate" title={err.errorMessage}>
                        {err.errorMessage}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{err.ip}</TableCell>
                      <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(err.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(err)}
                          className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800 gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Component */}
          {filteredErrors.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredErrors.length}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                isDark={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ERROR TELEMETRY DETAILS MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl max-h-[88vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                  {selectedError?.method}
                </Badge>
                <DialogTitle className="font-mono text-base font-semibold text-rose-400 truncate max-w-md">
                  {selectedError?.route}
                </DialogTitle>
              </div>
              <Badge variant="destructive">HTTP {selectedError?.statusCode}</Badge>
            </div>
            <DialogDescription className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <span>Request Correlation ID:</span>
              <span className="font-mono text-rose-400">{selectedError?.requestId}</span>
              <button
                type="button"
                onClick={() => selectedError?.requestId && handleCopyId(selectedError.requestId)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Copy Request ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </DialogDescription>
          </DialogHeader>

          {selectedError && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Primary Error Message Banner */}
              <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[13px]">Exception Summary</span>
                  <p className="mt-0.5 leading-relaxed">{selectedError.errorMessage}</p>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Latency
                  </span>
                  <p className="font-mono text-sm font-semibold text-slate-200 mt-1">
                    {selectedError.latency}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Client IP
                  </span>
                  <p className="font-mono text-sm font-semibold text-slate-200 mt-1">
                    {selectedError.ip}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    Tenant Business ID
                  </span>
                  <p className="font-mono text-xs font-medium text-slate-200 mt-1 truncate" title={selectedError.businessId}>
                    {selectedError.businessId || 'Platform / Global'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    User Actor ID
                  </span>
                  <p className="font-mono text-xs font-medium text-slate-200 mt-1 truncate" title={selectedError.userId}>
                    {selectedError.userId || 'Guest / Unauthenticated'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 col-span-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Timestamp
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-1">
                    {new Date(selectedError.timestamp).toLocaleString()} ({selectedError.timestamp})
                  </p>
                </div>
              </div>

              {/* User Agent */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-medium block">User Agent Header</span>
                <p className="font-mono text-[11px] text-slate-300 break-all">
                  {selectedError.userAgent || 'Not captured'}
                </p>
              </div>

              {/* Error Metadata / Stack Trace */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-rose-400" />
                    Stack Trace & Exception Metadata
                  </span>
                  <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-900">
                    Sanitized Trace
                  </Badge>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-rose-300/90 overflow-x-auto max-h-60 leading-relaxed">
                  <pre className="whitespace-pre-wrap break-all">
                    {selectedError.errorMetadata
                      ? JSON.stringify(selectedError.errorMetadata, null, 2)
                      : JSON.stringify(
                          {
                            message: selectedError.errorMessage,
                            statusCode: selectedError.statusCode,
                            route: selectedError.route,
                            httpMethod: selectedError.method,
                            requestId: selectedError.requestId,
                            timestamp: selectedError.timestamp,
                          },
                          null,
                          2
                        )}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-800 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
