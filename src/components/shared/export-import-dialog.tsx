"use client";

import { useState, useRef } from "react";
import { Download, Upload, Database } from "lucide-react";
import { toast } from "sonner";
import { exportAllData, importAllData } from "@/lib/utils/export-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportDialog({
  open,
  onOpenChange,
}: ExportImportDialogProps) {
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportAllData();
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importAllData(file);
      toast.success("Data imported successfully. Refresh to see changes.");
      window.location.reload();
    } catch {
      toast.error("Failed to import data. Check file format.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" /> Data Management
          </DialogTitle>
          <DialogDescription>
            Export your data as a backup or import from a previous backup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <Download className="h-4 w-4" />
            Export All Data (JSON)
          </Button>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Import Data from Backup"}
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Warning: Importing will replace all existing data with the backup
            contents.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
