import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '@receivables/shared';

export function downloadAgingSchedulePdf(
  data: {
    asOfDate?: string;
    currency?: string;
    agingSchedule?: string;
    bracketLabels?: string[];
    rows?: any[];
  },
  businessName: string = 'Receivables Management',
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const currency = data.currency || 'RWF';

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(businessName.toUpperCase(), 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // blue-600
  const scheduleNote = data.agingSchedule ? ` (${data.agingSchedule.toUpperCase()} SCHEDULE)` : '';
  doc.text(`A/R AGING SCHEDULE & PORTFOLIO BREAKDOWN${scheduleNote}`, 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = data.asOfDate ? new Date(data.asOfDate).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(`As of Date: ${dateStr}   |   Currency: ${currency}   |   Generated: ${new Date().toLocaleString()}`, 14, 31);

  // Dynamic Brackets
  const brackets = data.bracketLabels && data.bracketLabels.length > 0
    ? data.bracketLabels
    : ['current', '1-30', '31-60', '61-90', '91+'];

  const rows = data.rows || [];

  const headCols = [
    'Invoice Ref',
    'Customer',
    ...brackets.map((b) => (b === 'current' ? 'Current' : `${b} d`)),
    'Total Balance',
    'Status',
  ];

  const tableBody = rows.map((r) => [
    r.ref || r.referenceNumber || '—',
    r.customerName || r.customer || '—',
    ...brackets.map((b) => formatMoney(r.bracket === b ? r.outstandingBalance : 0, currency)),
    formatMoney(r.outstandingBalance || 0, currency),
    r.daysOverdue > 0 ? `${r.daysOverdue} days` : 'Current',
  ]);

  const bracketTotals = brackets.map((b) =>
    rows.reduce((s, r) => s + (r.bracket === b ? Number(r.outstandingBalance) : 0), 0),
  );
  const grandTotal = rows.reduce((s, r) => s + Number(r.outstandingBalance || 0), 0);

  const tableFoot = [
    [
      'TOTALS',
      `${rows.length} Active Records`,
      ...bracketTotals.map((tot) => formatMoney(tot, currency)),
      formatMoney(grandTotal, currency),
      '',
    ],
  ];

  autoTable(doc, {
    startY: 36,
    head: [headCols],
    body: tableBody,
    foot: tableFoot,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
    },
  });

  const sanitizedBiz = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`ar_aging_schedule_${sanitizedBiz}_${Date.now()}.pdf`);
}

export function downloadCustomerStatementPdf(
  customer: {
    customerCode?: string;
    name?: string;
    phone?: string;
    totalInvoiced?: number;
    totalPaid?: number;
    outstandingBalance?: number;
  },
  transactions: any[] = [],
  businessName: string = 'Receivables Management',
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currency = 'RWF';

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(businessName.toUpperCase(), 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('STATEMENT OF ACCOUNT', 14, 25);

  // Customer Summary Box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Customer Name: ${customer.name || 'Valued Customer'}`, 14, 33);
  doc.text(`Account Code: ${customer.customerCode || '—'}`, 14, 38);
  doc.text(`Phone: ${customer.phone || '—'}`, 14, 43);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 130, 33);
  doc.text(`Currency: ${currency}`, 130, 38);

  // Outstanding Box
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(130, 43, 66, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text('OUTSTANDING BALANCE:', 134, 50);
  doc.setFontSize(11);
  doc.text(formatMoney(customer.outstandingBalance || 0, currency), 134, 56);

  // Statement Table
  const tableBody = transactions.length > 0
    ? transactions.map((t) => [
        t.date || '—',
        t.ref || t.referenceNumber || '—',
        t.description || (t.type === 'PAYMENT' ? 'Payment Received' : 'Invoice Issued'),
        t.invoiced ? formatMoney(t.invoiced, currency) : '—',
        t.paid ? formatMoney(t.paid, currency) : '—',
        formatMoney(t.balance, currency),
      ])
    : [
        [
          new Date().toLocaleDateString(),
          'BALANCE-FWD',
          'Current Accounts Receivable Position',
          formatMoney(customer.totalInvoiced || 0, currency),
          formatMoney(customer.totalPaid || 0, currency),
          formatMoney(customer.outstandingBalance || 0, currency),
        ],
      ];

  autoTable(doc, {
    startY: 64,
    head: [['Date', 'Reference', 'Description', 'Invoiced (Debit)', 'Paid (Credit)', 'Balance']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    styles: {
      cellPadding: 3,
    },
  });

  const code = (customer.customerCode || 'statement').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`statement_${code}_${Date.now()}.pdf`);
}

export function downloadPaymentsReportPdf(
  paymentsData: {
    payments?: any[];
    byMethod?: Record<string, number>;
  },
  businessName: string = 'Receivables Management',
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currency = 'RWF';

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(businessName.toUpperCase(), 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('PAYMENTS & COLLECTIONS SUMMARY REPORT', 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}   |   Currency: ${currency}`, 14, 31);

  // Method Breakdown Summary
  const methods = Object.entries(paymentsData.byMethod || {});
  let startY = 38;

  if (methods.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Summary by Payment Method:', 14, startY);

    const methodRows = methods.map(([m, total]) => [
      m.replace(/_/g, ' '),
      formatMoney(Number(total), currency),
    ]);

    autoTable(doc, {
      startY: startY + 3,
      head: [['Payment Method', 'Total Collected']],
      body: methodRows,
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5 },
      styles: { cellPadding: 2.5 },
      tableWidth: 100,
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Payments Detailed Table
  const payments = paymentsData.payments || [];
  const totalAmount = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const tableBody = payments.map((p) => [
    p.ref || p.referenceNumber || '—',
    p.date || '—',
    p.customer || '—',
    p.method?.replace(/_/g, ' ') || '—',
    p.reference || '—',
    formatMoney(p.amount, currency),
  ]);

  const tableFoot = [['TOTALS', '', '', '', `${payments.length} Payments`, formatMoney(totalAmount, currency)]];

  autoTable(doc, {
    startY,
    head: [['Receipt Ref', 'Date', 'Customer', 'Method', 'External Ref', 'Amount']],
    body: tableBody,
    foot: tableFoot,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    styles: {
      cellPadding: 3,
    },
  });

  const sanitizedBiz = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`payments_collections_${sanitizedBiz}_${Date.now()}.pdf`);
}
