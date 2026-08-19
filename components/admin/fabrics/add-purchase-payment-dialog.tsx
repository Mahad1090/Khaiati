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
import { addPurchasePayment } from "@/lib/actions/fabric-transactions";
import { useLanguage } from "@/lib/i18n/language-context";

export function AddPurchasePaymentDialog({
  purchaseId,
  outstanding,
}: {
  purchaseId: string;
  outstanding: number;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    setSubmitting(true);
    try {
      const result = await addPurchasePayment(purchaseId, Number(amount));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.fabrics.paymentRecorded);
      setOpen(false);
      setAmount("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={outstanding <= 0}>
          <Plus className="h-3 w-3" />
          {t.fabrics.pay}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.fabrics.paySupplierBalance}</DialogTitle>
        </DialogHeader>
        <div>
          <Label>{t.fabrics.amountOutstanding} {outstanding.toFixed(2)})</Label>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.fabrics.savePayment}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
