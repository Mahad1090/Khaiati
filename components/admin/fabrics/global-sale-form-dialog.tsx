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
import { FabricPicker } from "@/components/admin/fabrics/fabric-picker";
import { CustomerPicker } from "@/components/admin/orders/customer-picker";
import { saleSchema, type SaleInput } from "@/lib/validation/fabric";
import { createSale } from "@/lib/actions/fabric-transactions";
import { formatMoney } from "@/lib/format";

export function GlobalSaleFormDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      fabric_id: "",
      customer_id: "",
      color: "",
      size_meters: 0,
      price_per_meter: 0,
      sale_date: new Date().toISOString().slice(0, 10),
      amount_paid: 0,
      note: "",
    },
  });

  const pricePerMeter = form.watch("price_per_meter");
  const sizeMeters = form.watch("size_meters");
  const totalPrice = useMemo(
    () => (Number(pricePerMeter) || 0) * (Number(sizeMeters) || 0),
    [pricePerMeter, sizeMeters]
  );

  async function onSubmit(values: SaleInput) {
    const result = await createSale(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Sale ${result.data.sale_no} recorded`);
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Fabric Sale</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fabric_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabric</FormLabel>
                  <FormControl>
                    <FabricPicker value={field.value} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer (optional)</FormLabel>
                  <FormControl>
                    <CustomerPicker value={field.value ?? ""} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Size (meters)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="price_per_meter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price / Meter</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Sale total: <span className="text-foreground">{formatMoney(totalPrice)}</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid Now</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Sale"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
