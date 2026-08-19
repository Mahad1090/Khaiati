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
import { supplierSchema, type SupplierInput } from "@/lib/validation/fabric";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  mode?: "create" | "edit";
  supplierId?: string;
  defaultValues?: Partial<SupplierInput>;
  trigger?: React.ReactNode;
};

export function SupplierFormDialog({ mode = "create", supplierId, defaultValues, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      company_name: defaultValues?.company_name ?? "",
      contact_person: defaultValues?.contact_person ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      company_number: defaultValues?.company_number ?? "",
      note: defaultValues?.note ?? "",
    },
  });

  async function onSubmit(values: SupplierInput) {
    const result =
      mode === "edit" && supplierId ? await updateSupplier(supplierId, values) : await createSupplier(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? t.suppliers.supplierUpdated : t.suppliers.supplierAdded);
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
            {t.suppliers.newSupplier}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? t.suppliers.editSupplier : t.suppliers.newSupplier}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.suppliers.companyName}</FormLabel>
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
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.suppliers.contactPersonField}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.suppliers.phone}</FormLabel>
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
              name="company_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.suppliers.companyNumber}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.suppliers.address}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
