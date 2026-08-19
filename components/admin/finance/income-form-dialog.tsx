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
import { addIncome } from "@/lib/actions/finance";
import { useLanguage } from "@/lib/i18n/language-context";

export function IncomeFormDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    setSubmitting(true);
    try {
      const result = await addIncome({ amount, income_date: date, note });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.finance.incomeRecorded);
      setOpen(false);
      setAmount("");
      setNote("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          {t.finance.addOtherIncome}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.finance.addOtherIncome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t.finance.amount}</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>{t.finance.date}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>{t.adminCommon.note}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.finance.sourceOfIncome} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.finance.saveIncome}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
