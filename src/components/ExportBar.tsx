import { Download, FileText } from "lucide-react";
import { exportCSV } from "../utils/helper";

export default function ExportBar({ label, expenses }: { label: string; expenses: any[] }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => exportCSV(label, expenses)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Download size={12} /> CSV
      </button>
      <button
        onClick={() => alert("PDF export is handled in App original implementation")}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <FileText size={12} /> PDF
      </button>
    </div>
  );
}
