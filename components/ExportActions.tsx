
import React from 'react';
import { Download, FileText, Table as TableIcon, FileDigit } from 'lucide-react';
import { Business } from '../types';

interface ExportActionsProps {
  data: Business[];
}

const ExportActions: React.FC<ExportActionsProps> = ({ data }) => {
  if (data.length === 0) return null;

  const exportCSV = () => {
    const headers = ['Name', 'Address', 'Phone', 'Website', 'Maps Link', 'Rating', 'Reviews'];
    const rows = data.map(b => [
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      b.website,
      b.profileLink,
      b.rating,
      b.reviewCount
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${Date.now()}.csv`;
    link.click();
  };

  const exportPDF = () => {
    // Basic print-to-pdf using window.print() styled for tables
    // In a full production app, we would use jspdf-autotable
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between no-print">
      <div className="text-sm text-gray-500 italic">
        *Data is publicly available from Google Maps. Use responsibly.
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={exportCSV}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-medium shadow-sm"
        >
          <TableIcon size={16} />
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all text-sm font-medium shadow-sm"
        >
          <FileText size={16} />
          Print / PDF
        </button>
      </div>
    </div>
  );
};

export default ExportActions;
