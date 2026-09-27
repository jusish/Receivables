import React from 'react';
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

const samplePayments = [
  {
    id: 'pay_1',
    ref: 'PAY-000101',
    customer: 'John Doe Ltd',
    amount: 350000,
    unallocated: 0,
    date: '2026-09-20',
    method: 'MOBILE_MONEY',
    reference: 'MOMO-987123',
    status: 'COMPLETED',
  },
  {
    id: 'pay_2',
    ref: 'PAY-000102',
    customer: 'Kigali Supermarket Ltd',
    amount: 1200000,
    unallocated: 0,
    date: '2026-09-18',
    method: 'BANK_TRANSFER',
    reference: 'BK-TRF-00192',
    status: 'COMPLETED',
  },
];

export const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h2>
          <p className="text-sm text-slate-500 mt-1">
            Recorded customer payments, allocations to receivables, and credit reconciliation.
          </p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search payment ref or customer..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount Received</TableHead>
                <TableHead className="text-right">Unallocated</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Txn Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samplePayments.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="font-mono text-xs font-semibold text-emerald-600">
                    {pay.ref}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{pay.customer}</TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatMoney(pay.amount, 'RWF')}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {formatMoney(pay.unallocated, 'RWF')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {pay.method.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {pay.reference}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{pay.date}</TableCell>
                  <TableCell>
                    <Badge variant="success">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      View
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
