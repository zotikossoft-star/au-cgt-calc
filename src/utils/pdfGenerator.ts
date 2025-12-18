import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FYSummary, PDFReport, ProcessingResult } from '../types';
import { formatDate, formatCurrency, getFYDateRange } from './fileDetector';

/**
 * Generate PDF reports for each financial year
 */
export function generatePDFReports(result: ProcessingResult): PDFReport[] {
  const reports: PDFReport[] = [];

  for (const fySummary of result.summaryByFY) {
    const pdf = generateFYReport(fySummary, result.ownerName, result.fileType);
    const blob = pdf.output('blob');
    
    reports.push({
      fy: fySummary.fy,
      blob,
      filename: `${result.ownerName}_${result.fileType.toUpperCase()}_CGT_${fySummary.fy}.pdf`,
    });
  }

  return reports;
}

/**
 * Generate a single FY report
 */
function generateFYReport(
  summary: FYSummary,
  ownerName: string,
  fileType: string
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Colors
  const primaryColor: [number, number, number] = [31, 78, 121]; // #1F4E79
  const secondaryColor: [number, number, number] = [46, 117, 182]; // #2E75B6
  const successColor: [number, number, number] = [198, 239, 206]; // #C6EFCE
  const dangerColor: [number, number, number] = [255, 199, 206]; // #FFC7CE
  const warningColor: [number, number, number] = [255, 255, 0]; // Yellow

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('AUSTRALIAN CAPITAL GAINS TAX REPORT', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Subtitle
  doc.setFontSize(14);
  doc.text(`${fileType.toUpperCase()} - ${ownerName}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.text(summary.fy, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Report Info Box
  const { start: fyStart, end: fyEnd } = getFYDateRange(summary.fy);
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const infoLines = [
    `Financial Year: ${formatDate(fyStart)} - ${formatDate(fyEnd)}`,
    `Generated: ${formatDate(new Date())}`,
    `Cost Basis Method: FIFO (First In, First Out)`,
    `Tax Jurisdiction: Australia (ATO)`,
  ];

  for (const line of infoLines) {
    doc.text(line, 14, y);
    y += 5;
  }
  y += 8;

  // TAX SUMMARY Section
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('TAX SUMMARY', 14, y);
  y += 6;

  if (summary.events.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No CGT events (disposals) in this financial year.', 14, y);
    y += 8;
  } else {
    // Summary table
    const summaryData = [
      ['CGT Events', summary.events.length.toString()],
      ['Total Proceeds', formatCurrency(summary.totalProceeds)],
      ['Total Cost Base', formatCurrency(summary.totalCostBase)],
      ['', ''],
      ['Short-term Gains (<12 months)', formatCurrency(summary.shortTermGains)],
      ['Short-term Losses', formatCurrency(summary.shortTermLosses)],
      ['Long-term Gains (>12 months)', formatCurrency(summary.longTermGains)],
      ['Long-term Losses', formatCurrency(summary.longTermLosses)],
      ['', ''],
      ['Gross Capital Gain/Loss', formatCurrency(summary.grossCapitalGain)],
      ['50% CGT Discount', formatCurrency(-summary.totalDiscount)],
      ['NET CAPITAL GAIN (Item 18)', formatCurrency(summary.netCapitalGain)],
    ];

    autoTable(doc, {
      startY: y,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right', cellWidth: 40 },
      },
      didParseCell: (data) => {
        if (data.row.index === summaryData.length - 1) {
          data.cell.styles.fillColor = warningColor;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // CGT EVENTS DETAIL
  if (summary.events.length > 0) {
    // Short-term events
    const shortTermEvents = summary.events.filter(e => !e.isLongTerm);
    const longTermEvents = summary.events.filter(e => e.isLongTerm);

    if (shortTermEvents.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('SHORT-TERM CAPITAL GAINS (<12 months) - No CGT Discount', 14, y);
      y += 4;

      const stData = shortTermEvents.map(e => [
        formatDate(e.disposalDate),
        formatDate(e.acquisitionDate),
        e.asset,
        e.quantity.toFixed(4),
        formatCurrency(e.proceeds),
        formatCurrency(e.costBase),
        formatCurrency(e.grossGainLoss),
        e.holdingDays.toString(),
        formatCurrency(e.netCapitalGain),
      ]);

      // Add subtotal
      stData.push([
        'SUBTOTAL', '', '', '',
        formatCurrency(shortTermEvents.reduce((s, e) => s + e.proceeds, 0)),
        formatCurrency(shortTermEvents.reduce((s, e) => s + e.costBase, 0)),
        formatCurrency(shortTermEvents.reduce((s, e) => s + e.grossGainLoss, 0)),
        '',
        formatCurrency(shortTermEvents.reduce((s, e) => s + e.netCapitalGain, 0)),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Disposal', 'Acquisition', 'Asset', 'Qty', 'Proceeds', 'Cost', 'Gain/Loss', 'Days', 'Net CGT']],
        body: stData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [198, 89, 17], textColor: 255 },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
          8: { halign: 'right' },
        },
        didParseCell: (data) => {
          // Color code gain/loss column
          if (data.column.index === 6 && data.section === 'body' && data.row.index < shortTermEvents.length) {
            const value = shortTermEvents[data.row.index].grossGainLoss;
            data.cell.styles.fillColor = value >= 0 ? successColor : dangerColor;
          }
          // Subtotal row
          if (data.row.index === stData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [252, 228, 214];
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Long-term events
    if (longTermEvents.length > 0) {
      // Check if we need a new page
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('LONG-TERM CAPITAL GAINS (>12 months) - 50% CGT Discount Eligible', 14, y);
      y += 4;

      const ltData = longTermEvents.map(e => [
        formatDate(e.disposalDate),
        formatDate(e.acquisitionDate),
        e.asset,
        e.quantity.toFixed(4),
        formatCurrency(e.proceeds),
        formatCurrency(e.costBase),
        formatCurrency(e.grossGainLoss),
        e.holdingDays.toString(),
        formatCurrency(e.cgtDiscountAmount),
        formatCurrency(e.netCapitalGain),
      ]);

      // Add subtotal
      ltData.push([
        'SUBTOTAL', '', '', '',
        formatCurrency(longTermEvents.reduce((s, e) => s + e.proceeds, 0)),
        formatCurrency(longTermEvents.reduce((s, e) => s + e.costBase, 0)),
        formatCurrency(longTermEvents.reduce((s, e) => s + e.grossGainLoss, 0)),
        '',
        formatCurrency(longTermEvents.reduce((s, e) => s + e.cgtDiscountAmount, 0)),
        formatCurrency(longTermEvents.reduce((s, e) => s + e.netCapitalGain, 0)),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Disposal', 'Acquisition', 'Asset', 'Qty', 'Proceeds', 'Cost', 'Gain/Loss', 'Days', 'Discount', 'Net CGT']],
        body: ltData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: secondaryColor, textColor: 255 },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
          8: { halign: 'right' },
          9: { halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.column.index === 6 && data.section === 'body' && data.row.index < longTermEvents.length) {
            const value = longTermEvents[data.row.index].grossGainLoss;
            data.cell.styles.fillColor = value >= 0 ? successColor : dangerColor;
          }
          if (data.row.index === ltData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [221, 235, 247];
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ATO FILING NOTES
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('ATO FILING NOTES', 14, y);
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const notes = [
    '• Report NET CAPITAL GAIN at Item 18 in your tax return',
    '• 50% CGT discount applies to assets held > 12 months',
    '• Capital losses can only offset capital gains (not other income)',
    '• Unused losses can be carried forward indefinitely',
    '• Keep all records for at least 5 years',
    '',
    'Disclaimer: This report is for informational purposes only.',
    'Consult a registered tax agent for professional advice.',
  ];

  for (const note of notes) {
    doc.text(note, 14, y);
    y += 4;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by CGT Calculator | ${formatDate(new Date())}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Trigger download of a PDF report
 */
export function downloadPDF(report: PDFReport): void {
  const url = URL.createObjectURL(report.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = report.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download all reports as separate files
 */
export function downloadAllPDFs(reports: PDFReport[]): void {
  reports.forEach((report, index) => {
    setTimeout(() => downloadPDF(report), index * 500);
  });
}
