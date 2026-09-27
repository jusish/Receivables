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
import { Plus, Search, Phone, Eye } from 'lucide-react';
import { formatMoney } from '@receivables/shared';

const sampleCustomers = [
  {
    id: 'cus_1',
    customerCode: 'CUS-000128',
    name: 'John Doe Ltd',
    phone: '+250 788 111 222',
    outstanding: 1250000,
    overdue: 450000,
    creditLimit: 2000000,
    status: 'ACTIVE',
  },
  {
    id: 'cus_2',
    customerCode: 'CUS-000129',
    name: 'Kigali Supermarket Ltd',
    phone: '+250 788 333 444',
    outstanding: 3400000,
    overdue: 0,
    creditLimit: 5000000,
    status: 'ACTIVE',
  },
  {
    id: 'cus_3',
    customerCode: 'CUS-000130',
    name: 'Inzovu Hardware Supplies',
    phone: '+250 788 555 666',
    outstanding: 850000,
    overdue: 850000,
    creditLimit: 1000000,
    status: 'ACTIVE',
  },
];

export const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer accounts, phone contacts, credit limits, and receivable balances.
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name, phone or code..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleCustomers.map((cus) => (
                <TableRow key={cus.id}>
                  <TableCell className="font-mono text-xs font-semibold text-blue-600">
                    {cus.customerCode}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{cus.name}</TableCell>
                  <TableCell className="text-slate-600 flex items-center gap-1.5 py-4">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cus.phone}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(cus.outstanding, 'RWF')}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">
                    {cus.overdue > 0 ? formatMoney(cus.overdue, 'RWF') : '—'}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {formatMoney(cus.creditLimit, 'RWF')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
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
