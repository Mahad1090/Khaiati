"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBackup } from "@/lib/actions/backup";
import { useLanguage } from "@/lib/i18n/language-context";

export function BackupButton() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const result = await createBackup();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const blob = new Blob([result.data.sql], { type: "application/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.settingsPage.backupDownloaded);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={run} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {t.settingsPage.runManualBackup}
    </Button>
  );
}
