"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierPicker } from "@/components/admin/suppliers/supplier-picker";
import { purchaseSchema, type PurchaseInput, paymentTypes, paymentTypeLabels } from "@/lib/validation/fabric";
import { createPurchase } from "@/lib/actions/fabric-transactions";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/language-context";

export function PurchaseFormDialog({ fabricId }: { fabricId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<PurchaseInput>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      fabric_id: fabricId,
      supplier_id: "",
      company_bill_number: "",
      price_per_meter: 0,
      size_meters: 0,
      color: "",
      sale_price: 0,
      purchase_date: new Date().toISOString().slice(0, 10),
      amount_paid: 0,
      payment_type: "cash",
      note: "",
    },
  });

  const pricePerMeter = form.watch("price_per_meter");
  const sizeMeters = form.watch("size_meters");
  const totalPrice = useMemo(
    () => (Number(pricePerMeter) || 0) * (Number(sizeMeters) || 0),
    [pricePerMeter, sizeMeters]
  );

  async function onSubmit(values: PurchaseInput) {
    const result = await createPurchase(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${t.fabrics.purchaseRecorded} ${result.data.purchase_no} ${t.fabrics.purchaseRecordedSuffix}`);
    setOpen(false);
    form.reset({ ...values, supplier_id: "", size_meters: 0, amount_paid: 0, note: "" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          {t.fabrics.recordPurchase}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.fabrics.recordFabricPurchase}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fabrics.supplierCol}</FormLabel>
                  <FormControl>
                    <SupplierPicker value={field.value} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_bill_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.companyBillNo}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.color}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_meter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.priceMeter}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.sizeMeters}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t.fabrics.purchaseTotal} <span className="text-foreground">{formatMoney(totalPrice)}</span>
            </p>
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fabrics.intendedSalePrice}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.purchaseDate}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.paymentType}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentTypes.map((p) => (
                          <SelectItem key={p} value={p}>
                            {paymentTypeLabels[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fabrics.amountPaidNow}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.adminCommon.note}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.fabrics.savePurchase}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
