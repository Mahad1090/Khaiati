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
import { customerSchema, type CustomerInput } from "@/lib/validation/customer";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  mode?: "create" | "edit";
  customerId?: string;
  defaultValues?: Partial<CustomerInput>;
  trigger?: React.ReactNode;
};

export function CustomerFormDialog({
  mode = "create",
  customerId,
  defaultValues,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      note: defaultValues?.note ?? "",
    },
  });

  async function onSubmit(values: CustomerInput) {
    const result =
      mode === "edit" && customerId
        ? await updateCustomer(customerId, values)
        : await createCustomer(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? t.customers.customerUpdated : t.customers.customerAdded);
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
            {t.customers.newCustomer}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? t.customers.editCustomer : t.customers.newCustomer}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.adminCommon.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.customers.customerName} {...field} />
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
                  <FormLabel>{t.adminCommon.phone}</FormLabel>
                  <FormControl>
                    <Input placeholder="+92 300 1234567" {...field} />
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
                    <Textarea placeholder={t.adminCommon.optionalNote} {...field} />
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
