import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@receivables/ui';
import { Plus, Search, Eye } from 'lucide-react';
import { formatMoney } from '@receivables/shared';

const sampleReceivables = [
  {
    id: 'rec_1',
    ref: 'REC-000184',
    customer: 'John Doe Ltd',
    customerPhone: '+250 788 111 222',
    originalAmount: 750000,
    paidAmount: 350000,
    outstanding: 400000,
    dueDate: '2026-10-15',
    status: 'ACTIVE',
    isOverdue: true,
    overdueDays: 12,
  },
  {
    id: 'rec_2',
    ref: 'REC-000185',
    customer: 'Kigali Supermarket Ltd',
    customerPhone: '+250 788 333 444',
    originalAmount: 1200000,
    paidAmount: 1200000,
    outstanding: 0,
    dueDate: '2026-09-20',
    status: 'PAID',
    isOverdue: false,
    overdueDays: 0,
  },
  {
    id: 'rec_3',
    ref: 'REC-000186',
    customer: 'Inzovu Hardware Supplies',
    customerPhone: '+250 788 555 666',
    originalAmount: 500000,
    paidAmount: 0,
    outstanding: 500000,
    dueDate: '2026-10-30',
    status: 'PENDING_ACTIVATION',
    isOverdue: false,
    overdueDays: 0,
  },
];

export const ReceivablesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Receivables</h2>
          <p className="text-sm text-slate-500 mt-1">
            Accounts receivable records, activation triggers, terms, and payment statuses.
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Create Receivable
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search receivable ref or customer..." className="pl-9" />
            </div>

            {/* Quick status filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'PENDING', 'ACTIVE', 'OVERDUE', 'PAID'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleReceivables.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono text-xs font-semibold text-blue-600">
                    {rec.ref}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{rec.customer}</p>
                      <p className="text-xs text-slate-500">{rec.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(rec.originalAmount, 'RWF')}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {formatMoney(rec.paidAmount, 'RWF')}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatMoney(rec.outstanding, 'RWF')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{rec.dueDate}</p>
                      {rec.isOverdue && (
                        <span className="text-[10px] font-semibold text-rose-600">
                          {rec.overdueDays} days overdue
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rec.status === 'PAID' && <Badge variant="success">Paid</Badge>}
                    {rec.status === 'ACTIVE' && rec.isOverdue && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                    {rec.status === 'ACTIVE' && !rec.isOverdue && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {rec.status === 'PENDING_ACTIVATION' && (
                      <Badge variant="secondary">Pending Activation</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
