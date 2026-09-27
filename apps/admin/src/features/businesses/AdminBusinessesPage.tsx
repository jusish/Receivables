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
  Button,
} from '@receivables/ui';
import { Search, Eye } from 'lucide-react';
import { formatMoney } from '@receivables/shared';

const sampleBusinesses = [
  {
    id: 'biz_1',
    code: 'BIZ-KTC',
    name: 'Kigali Trading Co.',
    currency: 'RWF',
    status: 'ACTIVE',
    usersCount: 5,
    receivablesCount: 42,
    outstanding: 12450000,
    createdAt: '2026-01-15',
  },
  {
    id: 'biz_2',
    code: 'BIZ-INZ',
    name: 'Inzovu Supplies Ltd',
    currency: 'RWF',
    status: 'ACTIVE',
    usersCount: 3,
    receivablesCount: 18,
    outstanding: 4800000,
    createdAt: '2026-03-02',
  },
  {
    id: 'biz_3',
    code: 'BIZ-RUB',
    name: 'Rubavu Logistics Ltd',
    currency: 'RWF',
    status: 'ACTIVE',
    usersCount: 7,
    receivablesCount: 95,
    outstanding: 28900000,
    createdAt: '2026-02-10',
  },
];

export const AdminBusinessesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Registered Business Tenants
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Multi-tenant directory, subscription status, user counts, and ledger volumes.
        </p>
      </div>

      <Card className="bg-slate-950 border-slate-800 text-white">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by business name or code..."
              className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-900/50">
                <TableHead className="text-slate-400">Business Code</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Currency</TableHead>
                <TableHead className="text-slate-400 text-right">Users</TableHead>
                <TableHead className="text-slate-400 text-right">Receivables</TableHead>
                <TableHead className="text-slate-400 text-right">Outstanding Volume</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleBusinesses.map((biz) => (
                <TableRow key={biz.id} className="border-slate-800 hover:bg-slate-900/50">
                  <TableCell className="font-mono text-xs text-indigo-400 font-medium">
                    {biz.code}
                  </TableCell>
                  <TableCell className="font-medium text-white">{biz.name}</TableCell>
                  <TableCell className="text-xs text-slate-300">{biz.currency}</TableCell>
                  <TableCell className="text-right text-xs text-slate-300">
                    {biz.usersCount}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-300">
                    {biz.receivablesCount}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-emerald-400">
                    {formatMoney(biz.outstanding, 'RWF')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-300 hover:text-white gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Manage
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
