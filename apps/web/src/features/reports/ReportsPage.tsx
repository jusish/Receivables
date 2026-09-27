import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@receivables/ui';
import { FileDown, Filter } from 'lucide-react';

const reports = [
  {
    id: 'ar_aging',
    title: 'A/R Aging Summary & Detail',
    category: 'Financial',
    description:
      'Detailed breakdown of receivables across Current, 1-30, 31-60, 61-90, and 91+ day brackets.',
    pdfSupported: true,
  },
  {
    id: 'customer_balances',
    title: 'Customer Balances & Statements',
    category: 'Customer',
    description:
      'Comprehensive financial statement per customer with debit/credit ledger and transaction refs.',
    pdfSupported: true,
  },
  {
    id: 'payments_summary',
    title: 'Payment & Collection Report',
    category: 'Financial',
    description:
      'Reconciled incoming payments by payment method (Mobile Money, Cash, Bank Transfer).',
    pdfSupported: true,
  },
  {
    id: 'collection_performance',
    title: 'Collection Follow-up Effectiveness',
    category: 'Collections',
    description: 'Employee collection actions, outcomes, broken promises, and recovery rates.',
    pdfSupported: true,
  },
];

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Statements</h2>
          <p className="text-sm text-slate-500 mt-1">
            Standard accounts-receivable reports with centralized PDF generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="border-slate-200 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{report.category}</Badge>
                {report.pdfSupported && (
                  <Badge variant="secondary" className="text-[10px]">
                    PDF Export Available
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold text-slate-900 mt-2">
                {report.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 leading-relaxed">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5" />
                  Filter Data
                </Button>
                <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700">
                  <FileDown className="w-3.5 h-3.5" />
                  Generate PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
