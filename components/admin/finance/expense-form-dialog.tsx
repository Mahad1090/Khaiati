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
import { addExpense } from "@/lib/actions/finance";
import { expenseCategories, expenseCategoryLabels, type ExpenseCategory } from "@/lib/validation/finance";
import { useLanguage } from "@/lib/i18n/language-context";

export function ExpenseFormDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("shop");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    setSubmitting(true);
    try {
      const result = await addExpense({ category, amount, expense_date: date, note });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.finance.expenseRecorded);
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
          {t.finance.addExpense}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.finance.addShopExpense}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t.finance.category}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {expenseCategoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.adminCommon.optionalNote} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting || !amount}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.finance.saveExpense}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
