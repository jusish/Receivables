import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@receivables/ui';
import {
  FileText,
  FileDown,
  Eye,
  CheckCircle2,
  Table as TableIcon,
  BarChart3,
  Users,
  CreditCard,
  Download,
} from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  downloadAgingSchedulePdf,
  downloadCustomerStatementPdf,
  downloadPaymentsReportPdf,
} from '../../lib/pdf-export';

interface ReportConfig {
  id: 'ar_aging' | 'customer_balances' | 'payments_summary';
  title: string;
  category: string;
  description: string;
  endpoint: string;
  pdfSupported: boolean;
  icon: React.ReactNode;
}

const reportConfigs: ReportConfig[] = [
  {
    id: 'ar_aging',
    title: 'Accounts Receivable Aging Schedule',
    category: 'Portfolio Health',
    description:
      'Breakdown of outstanding invoices categorized across 0-30, 31-60, 61-90, and 90+ days aging brackets.',
    endpoint: '/reports/ar-aging',
    pdfSupported: true,
    icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'customer_balances',
    title: 'Customer Balances & Statements',
    category: 'Customer Ledger',
    description:
      'Comprehensive financial statements per customer with billed invoices, payments received, and net balances.',
    endpoint: '/reports/customer-statements',
    pdfSupported: true,
    icon: <Users className="w-5 h-5 text-indigo-600" />,
  },
  {
    id: 'payments_summary',
    title: 'Payments & Collections Report',
    category: 'Cash Flow',
    description:
      'Reconciled incoming payments categorized by payment method (Mobile Money, Cash, Bank Transfer).',
    endpoint: '/reports/payments',
    pdfSupported: true,
    icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
  },
];

export const ReportsPage: React.FC = () => {
  const { business } = useAuth();
  const [activeReport, setActiveReport] = useState<ReportConfig | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const businessName = business?.name || 'Kigali Trading Co.';

  const handleGeneratePdf = async (reportId: string, _title?: string) => {
    try {
      setDownloadingId(reportId);
      setExportNotice(null);

      if (reportId === 'ar_aging') {
        const data = await apiFetch('/reports/ar-aging');
        downloadAgingSchedulePdf(data, businessName);
        setExportNotice(`Aging Schedule PDF downloaded to your computer.`);
      } else if (reportId === 'customer_balances') {
        const data = await apiFetch('/reports/customer-statements');
        downloadCustomerStatementPdf(
          {
            name: `${businessName} - Customer Summary`,
            customerCode: 'ALL_CUSTOMERS',
            totalInvoiced: data.reduce((s: number, c: any) => s + (Number(c.totalInvoiced) || 0), 0),
            totalPaid: data.reduce((s: number, c: any) => s + (Number(c.totalPaid) || 0), 0),
            outstandingBalance: data.reduce((s: number, c: any) => s + (Number(c.outstandingBalance) || 0), 0),
          },
          data.map((c: any) => ({
            date: new Date().toLocaleDateString(),
            ref: c.customerCode,
            description: c.name,
            invoiced: c.totalInvoiced,
            paid: c.totalPaid,
            balance: c.outstandingBalance,
          })),
          businessName,
        );
        setExportNotice(`Customer Balances Statement PDF downloaded.`);
      } else if (reportId === 'payments_summary') {
        const data = await apiFetch('/reports/payments');
        downloadPaymentsReportPdf(data, businessName);
        setExportNotice(`Payments & Collections Report PDF downloaded.`);
      }
    } catch (err: any) {
      setExportNotice(`Download failed: ${err.message || 'Error generating PDF'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewReport = async (report: ReportConfig) => {
    setActiveReport(report);
    setModalOpen(true);
    setLoading(true);
    try {
      const data = await apiFetch(report.endpoint);
      setReportData(data);
    } catch (err: any) {
      setReportData({ error: err.message || 'Failed to fetch report data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast Notice */}
      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-xs font-semibold hover:underline text-emerald-700 ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Reports & Financial Ledgers
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Standard accounts-receivable reports with live data analysis and genuine PDF downloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5" />
            Tenant: {business?.name || 'Kigali Trading Co.'}
          </span>
        </div>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportConfigs.map((report) => {
          const isDownloading = downloadingId === report.id;
          return (
            <Card
              key={report.id}
              className="border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="p-5 sm:p-6 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {report.icon}
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    {report.category}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 mt-3 line-clamp-1">
                  {report.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 leading-relaxed min-h-[3rem]">
                  {report.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report)}
                    className="gap-1.5 text-xs h-9 justify-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Ledger
                  </Button>
                  <Button
                    size="sm"
                    disabled={isDownloading}
                    onClick={() => handleGeneratePdf(report.id, report.title)}
                    className="gap-1.5 text-xs h-9 justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    {isDownloading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FULLY RESPONSIVE REPORT DATA MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-4xl max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3 pr-6">
              <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                <TableIcon className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="truncate">{activeReport?.title}</span>
              </DialogTitle>
              <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                Live Ledger
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Real-time records from PostgreSQL database for {businessName}.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Querying ledger records...</p>
            </div>
          ) : reportData?.error ? (
            <div className="py-12 text-center text-sm text-rose-600 bg-rose-50 rounded-lg p-4">
              {reportData.error}
            </div>
          ) : activeReport?.id === 'ar_aging' ? (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span>
                  <strong>As of Date:</strong>{' '}
                  {reportData?.asOfDate
                    ? new Date(reportData.asOfDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </span>
                <span>
                  <strong>Aging Schedule:</strong>{' '}
                  <Badge variant="outline" className="text-[10px] uppercase font-mono ml-1">
                    {reportData?.agingSchedule || 'STANDARD'}
                  </Badge>
                </span>
                <span>
                  <strong>Currency:</strong> {reportData?.currency || 'RWF'}
                </span>
                <span>
                  <strong>Total Records:</strong> {reportData?.rows?.length || 0}
                </span>
              </div>

              {/* Dynamic Bracket Metric Cards */}
              {reportData?.bracketLabels && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {reportData.bracketLabels.map((bracket: string) => {
                    const matching = (reportData.rows || []).filter((r: any) => r.bracket === bracket);
                    const totalAmt = matching.reduce(
                      (s: number, r: any) => s + (Number(r.outstandingBalance) || 0),
                      0
                    );
                    return (
                      <div
                        key={bracket}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
                      >
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                          {bracket === 'current' ? 'Current' : `${bracket} Days`}
                        </span>
                        <p className="text-base font-bold text-slate-900 mt-1">
                          {formatMoney(totalAmt, reportData.currency || 'RWF')}
                        </p>
                        <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {matching.length} {matching.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs min-w-[550px]">
                  <thead className="bg-slate-100/80 text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left font-semibold">Ref</th>
                      <th className="p-2.5 text-left font-semibold">Customer</th>
                      <th className="p-2.5 text-left font-semibold">Due Date</th>
                      <th className="p-2.5 text-right font-semibold">Outstanding</th>
                      <th className="p-2.5 text-center font-semibold">Overdue Days</th>
                      <th className="p-2.5 text-left font-semibold">Aging Bracket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.rows?.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-mono font-semibold text-blue-600">{row.ref}</td>
                        <td className="p-2.5 font-medium text-slate-900">{row.customerName}</td>
                        <td className="p-2.5 text-slate-500">{row.dueDate || 'N/A'}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatMoney(row.outstandingBalance, reportData.currency || 'RWF')}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-rose-600">
                          {row.daysOverdue > 0 ? `${row.daysOverdue} d` : 'Current'}
                        </td>
                        <td className="p-2.5">
                          <Badge
                            variant={row.bracket === 'current' ? 'default' : 'destructive'}
                            className="text-[10px]"
                          >
                            {row.bracket === 'current' ? 'Current' : `${row.bracket} d`}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeReport?.id === 'customer_balances' ? (
            <div className="space-y-4 pt-2">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs min-w-[550px]">
                  <thead className="bg-slate-100/80 text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left font-semibold">Code</th>
                      <th className="p-2.5 text-left font-semibold">Customer</th>
                      <th className="p-2.5 text-right font-semibold">Invoiced</th>
                      <th className="p-2.5 text-right font-semibold">Paid</th>
                      <th className="p-2.5 text-right font-semibold">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.map((c: any) => (
                      <tr key={c.customerId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-mono font-semibold text-blue-600">
                          {c.customerCode}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900">{c.name}</td>
                        <td className="p-2.5 text-right">{formatMoney(c.totalInvoiced, 'RWF')}</td>
                        <td className="p-2.5 text-right text-emerald-600 font-semibold">
                          {formatMoney(c.totalPaid, 'RWF')}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatMoney(c.outstandingBalance, 'RWF')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Responsive Method Distribution Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(reportData?.byMethod || {}).map(([method, total]: any) => (
                  <div
                    key={method}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="text-slate-500 font-medium block truncate">
                      {method.replace(/_/g, ' ')}
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-1">
                      {formatMoney(total, 'RWF')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs min-w-[550px]">
                  <thead className="bg-slate-100/80 text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left font-semibold">Receipt Ref</th>
                      <th className="p-2.5 text-left font-semibold">Customer</th>
                      <th className="p-2.5 text-left font-semibold">Method</th>
                      <th className="p-2.5 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.payments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-mono font-semibold text-emerald-600">{p.ref}</td>
                        <td className="p-2.5 font-medium text-slate-900">{p.customer}</td>
                        <td className="p-2.5 text-slate-600 font-medium">
                          {p.method?.replace(/_/g, ' ')}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatMoney(p.amount, 'RWF')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t border-slate-100">
            {activeReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGeneratePdf(activeReport.id, activeReport.title)}
                className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download This Table as PDF
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
