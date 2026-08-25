"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WorkerPicker } from "@/components/admin/workers/worker-picker";
import { addWorkerAdvance } from "@/lib/actions/workers";
import { useLanguage } from "@/lib/i18n/language-context";

export function GlobalAdvanceFormDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!workerId) {
      toast.error(t.workers.selectWorker);
      return;
    }
    setSubmitting(true);
    try {
      const result = await addWorkerAdvance(workerId, {
        amount,
        advance_date: date,
        salary_period: period,
        reason,
        note,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.workers.advanceRecorded);
      setOpen(false);
      setAmount("");
      setReason("");
      setNote("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t.workers.recordAdvance}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.workers.recordAdvanceSalary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t.workers.worker}</Label>
            <WorkerPicker value={workerId} onChange={(id) => setWorkerId(id)} />
          </div>
          <div>
            <Label>{t.workers.amount}</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>{t.workers.date}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>{t.workers.salaryPeriod}</Label>
            <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder={t.workers.salaryPeriodPlaceholder} />
          </div>
          <div>
            <Label>{t.workers.reason}</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.adminCommon.optionalNote} />
          </div>
          <div>
            <Label>{t.workers.note}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.adminCommon.optionalNote} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.workers.saveAdvance}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
