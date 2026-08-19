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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkerPicker } from "@/components/admin/workers/worker-picker";
import { addWorkerPayment } from "@/lib/actions/workers";
import { payModels, payModelLabels, type PayModel } from "@/lib/validation/worker";

export function GlobalPaymentFormDialog() {
  const [open, setOpen] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [payModel, setPayModel] = useState<PayModel>("per_job");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!workerId) {
      toast.error("Select a worker");
      return;
    }
    setSubmitting(true);
    try {
      const result = await addWorkerPayment(workerId, {
        pay_model: payModel,
        amount,
        period_start: periodStart,
        period_end: periodEnd,
        paid_at: paidAt,
        note,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Payment recorded");
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
        <Button>
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Salary / Wage Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Worker</Label>
            <WorkerPicker value={workerId} onChange={(id) => setWorkerId(id)} />
          </div>
          <div>
            <Label>Pay Model</Label>
            <Select value={payModel} onValueChange={(v) => setPayModel(v as PayModel)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payModels.map((m) => (
                  <SelectItem key={m} value={m}>
                    {payModelLabels[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period Start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label>Period End</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div>
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
