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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceSchema, type ServiceInput } from "@/lib/validation/marketplace";
import { garmentTypeLabels, garmentTypes } from "@/lib/validation/design";
import { createService, updateService } from "@/lib/actions/services";
import { useLanguage } from "@/lib/i18n/language-context";

export function ServiceFormDialog({
  mode = "create",
  serviceId,
  defaultValues,
  trigger,
}: {
  mode?: "create" | "edit";
  serviceId?: string;
  defaultValues?: Partial<ServiceInput>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      categoryName: defaultValues?.categoryName ?? "",
      description: defaultValues?.description ?? "",
      clothing_category: defaultValues?.clothing_category ?? "",
      price: defaultValues?.price ?? 0,
      estimated_completion_days: defaultValues?.estimated_completion_days,
      is_available: defaultValues?.is_available ?? true,
    },
  });

  async function onSubmit(values: ServiceInput) {
    const result = mode === "edit" && serviceId ? await updateService(serviceId, values) : await createService(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? t.marketplace.serviceUpdated : t.marketplace.serviceAdded);
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
            {t.marketplace.newService}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? t.marketplace.editService : t.marketplace.newService}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.marketplace.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.marketplace.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clothing_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.marketplace.garmentType}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t.marketplace.any} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {garmentTypes.map((g) => (
                          <SelectItem key={g} value={g}>
                            {garmentTypeLabels[g]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.marketplace.category}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.marketplace.categoryAltPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.marketplace.price}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimated_completion_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.marketplace.estCompletionDays}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.marketplace.description}</FormLabel>
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
