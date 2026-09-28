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
  Search,
  ShieldAlert,
  Activity,
  Eye,
  Copy,
  Check,
  Clock,
  Building,
  User,
  Globe,
  FileCode,
} from 'lucide-react';
import { adminApiFetch } from '../../lib/api';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal Detail State
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await adminApiFetch(`/admin/requests${query}`);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadRequests();
  }, [search]);

  const handleOpenDetail = (req: any) => {
    setSelectedReq(req);
    setCopied(false);
    setModalOpen(true);
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startIndex = (page - 1) * pageSize;
  const paginatedRequests = requests.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <span>API Request Explorer</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed technical request logs with correlation IDs, latency tracking, client IPs, and
          sanitized payloads.
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
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by Request ID, route or IP..."
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs text-slate-400">
              Total Logged: <strong className="text-white">{requests.length}</strong>
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
                  <TableHead className="text-slate-400">Latency</TableHead>
                  <TableHead className="text-slate-400">Tenant / Context</TableHead>
                  <TableHead className="text-slate-400">Client IP</TableHead>
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                      Loading technical request telemetry...
                    </TableCell>
                  </TableRow>
                ) : paginatedRequests.length === 0 ? (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                      No requests recorded matching search filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((req) => (
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
                      <TableCell className="font-mono text-xs text-slate-300 max-w-[220px] truncate">
                        {req.route}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.statusCode < 300
                              ? 'success'
                              : req.statusCode < 500
                                ? 'warning'
                                : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {req.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">{req.latency}</TableCell>
                      <TableCell className="text-slate-300 text-xs max-w-[160px] truncate">
                        {req.business}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{req.ip}</TableCell>
                      <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(req.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(req)}
                          className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 gap-1"
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
          {requests.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={requests.length}
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

      {/* REQUEST TELEMETRY DETAILS MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full sm:max-w-3xl max-h-[88vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedReq?.method === 'POST' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {selectedReq?.method}
                </Badge>
                <DialogTitle className="font-mono text-base font-semibold text-slate-200 truncate max-w-md">
                  {selectedReq?.route}
                </DialogTitle>
              </div>
              <Badge
                variant={
                  selectedReq?.statusCode < 300
                    ? 'success'
                    : selectedReq?.statusCode < 500
                      ? 'warning'
                      : 'destructive'
                }
              >
                HTTP {selectedReq?.statusCode}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <span>Request ID:</span>
              <span className="font-mono text-indigo-400">{selectedReq?.requestId}</span>
              <button
                type="button"
                onClick={() => selectedReq?.requestId && handleCopyId(selectedReq.requestId)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Copy Request ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Latency
                  </span>
                  <p className="font-mono text-sm font-semibold text-slate-200 mt-1">
                    {selectedReq.latency}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Client IP
                  </span>
                  <p className="font-mono text-sm font-semibold text-slate-200 mt-1">
                    {selectedReq.ip}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    Tenant Business
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-1 truncate" title={selectedReq.business}>
                    {selectedReq.business}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    User Identity
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-1 truncate" title={selectedReq.user}>
                    {selectedReq.user}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 col-span-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Timestamp
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-1">
                    {new Date(selectedReq.timestamp).toLocaleString()} ({selectedReq.timestamp})
                  </p>
                </div>
              </div>

              {/* User Agent */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-medium block">User Agent Header</span>
                <p className="font-mono text-[11px] text-slate-300 break-all">
                  {selectedReq.userAgent || 'Not logged'}
                </p>
              </div>

              {/* Payload / Error Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    Request Telemetry & Sanitized Payload
                  </span>
                  <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                    JSON Sanitized
                  </Badge>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(
                      {
                        requestId: selectedReq.requestId,
                        httpMethod: selectedReq.method,
                        route: selectedReq.route,
                        statusCode: selectedReq.statusCode,
                        latencyMs: selectedReq.latencyMs,
                        businessId: selectedReq.businessId,
                        userId: selectedReq.userId,
                        ipAddress: selectedReq.ip,
                        userAgent: selectedReq.userAgent,
                        errorMetadata: selectedReq.errorMetadata,
                        timestamp: selectedReq.timestamp,
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
