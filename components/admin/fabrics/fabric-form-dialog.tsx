"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { SupplierPicker } from "@/components/admin/suppliers/supplier-picker";
import { fabricSchema, type FabricInput } from "@/lib/validation/fabric";
import { createFabric, updateFabric } from "@/lib/actions/fabrics";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  mode?: "create" | "edit";
  fabricId?: string;
  defaultValues?: Partial<FabricInput>;
  trigger?: React.ReactNode;
};

export function FabricFormDialog({ mode = "create", fabricId, defaultValues, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<FabricInput>({
    resolver: zodResolver(fabricSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      fabric_type: defaultValues?.fabric_type ?? "",
      supplier_id: defaultValues?.supplier_id ?? "",
      color: defaultValues?.color ?? "",
      price_per_meter: defaultValues?.price_per_meter ?? 0,
      selling_price: defaultValues?.selling_price ?? 0,
      unit: defaultValues?.unit ?? "meter",
      note: defaultValues?.note ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: FabricInput) {
    const result = mode === "edit" && fabricId ? await updateFabric(fabricId, values) : await createFabric(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? t.fabrics.fabricUpdated : t.fabrics.fabricAdded);
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" />
            {t.fabrics.newFabric}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? t.fabrics.editFabric : t.fabrics.newFabric}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fabrics.fabricName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fabric_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.fabricType}</FormLabel>
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
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fabrics.supplierCompany}</FormLabel>
                  <FormControl>
                    <SupplierPicker value={field.value ?? ""} onChange={(id) => field.onChange(id)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
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
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.sellingPrice}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fabrics.unit}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                  <FormLabel>{t.adminCommon.note}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t.adminCommon.saving : t.adminCommon.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
