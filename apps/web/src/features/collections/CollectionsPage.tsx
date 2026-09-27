import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@receivables/ui';
import { PhoneCall, Plus } from 'lucide-react';
import { formatMoney } from '@receivables/shared';

const sampleActivities = [
  {
    id: 'col_1',
    customer: 'John Doe Ltd',
    phone: '+250 788 111 222',
    receivableRef: 'REC-000184',
    outstanding: 400000,
    type: 'PHONE_CALL',
    outcome: 'PROMISED_TO_PAY',
    promisedDate: '2026-10-30',
    notes: 'Spoke with John. Confirmed bank transfer will be sent Friday.',
    actor: 'Alice (Accountant)',
    date: '2026-09-25',
  },
  {
    id: 'col_2',
    customer: 'Inzovu Hardware Supplies',
    phone: '+250 788 555 666',
    receivableRef: 'REC-000186',
    outstanding: 500000,
    type: 'PHONE_CALL',
    outcome: 'NO_ANSWER',
    promisedDate: null,
    notes: 'No answer on primary phone. Left follow-up reminder.',
    actor: 'Justin (Owner)',
    date: '2026-09-24',
  },
];

export const CollectionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Collections & Follow-ups
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track communication history, promised payment dates, and overdue follow-up tasks.
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Log Collection Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-amber-700">
              Follow-Ups Due Today
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">7 Tasks</div>
            <p className="text-xs text-amber-700 mt-1">Customers with promised payment dates</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-rose-700">
              Overdue Follow-ups
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">4 Tasks</div>
            <p className="text-xs text-rose-700 mt-1">Missed promises requiring escalations</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Promise Success Rate
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">78.5%</div>
            <p className="text-xs text-emerald-700 mt-1">Follow-up payments collected</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Receivable</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Promised Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Logged By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleActivities.map((act) => (
                <TableRow key={act.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{act.customer}</p>
                    <p className="text-xs text-slate-500">{act.phone}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 font-semibold">
                    {act.receivableRef}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {formatMoney(act.outstanding, 'RWF')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                      <PhoneCall className="w-3 h-3" />
                      Phone
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {act.outcome === 'PROMISED_TO_PAY' ? (
                      <Badge variant="warning">Promised to Pay</Badge>
                    ) : (
                      <Badge variant="secondary">No Answer</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-indigo-700">
                    {act.promisedDate || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {act.notes}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{act.actor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
