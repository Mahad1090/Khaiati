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
import { addOrderPayment } from "@/lib/actions/orders";
import { useLanguage } from "@/lib/i18n/language-context";

export function AddPaymentDialog({ orderId, balance }: { orderId: string; balance: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function submit() {
    setSubmitting(true);
    try {
      const result = await addOrderPayment(orderId, Number(amount), note);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.orders.paymentRecorded);
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
        <Button variant="outline" disabled={balance <= 0}>
          <Plus className="h-4 w-4" />
          {t.orders.recordPayment}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.orders.recordPayment}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t.orders.amountBalance} {balance.toFixed(2)})</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>{t.adminCommon.note}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.adminCommon.optionalNote} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.orders.savePayment}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
