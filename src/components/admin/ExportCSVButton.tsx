"use client";

import { Download } from "lucide-react";

export default function ExportCSVButton({ data, filename, className = "" }: { data?: any[]; filename: string; className?: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get all unique keys from the objects
    const headers = Array.from(new Set(data.flatMap(Object.keys)));

    // Convert to CSV
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers.map(header => {
          const val = row[header] === null || row[header] === undefined ? "" : String(row[header]);
          // Escape quotes and wrap in quotes if there is a comma
          return `"${val.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors ${className}`}
    >
      <Download size={16} />
      Export CSV
    </button>
  );
}
