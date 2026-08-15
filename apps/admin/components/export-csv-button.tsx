"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}

function download(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportCsvButton({
  fetchData,
  filename,
}: {
  fetchData: () => Promise<{ headers: string[]; rows: string[][] }>;
  filename: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { headers, rows } = await fetchData();
      if (rows.length === 0) {
        toast.info("Aucune donnée à exporter.");
        return;
      }
      const csv = toCsv(headers, rows);
      download(csv, filename);
      toast.success(`${rows.length} entrée${rows.length > 1 ? "s" : ""} exportée${rows.length > 1 ? "s" : ""}.`);
    } catch {
      toast.error("Erreur lors de l'export.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Export..." : "Exporter CSV"}
    </Button>
  );
}
