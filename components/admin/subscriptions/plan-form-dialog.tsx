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
import { planSchema, type PlanInput } from "@/lib/validation/subscription";
import { createPlan } from "@/lib/actions/subscriptions";
import { useLanguage } from "@/lib/i18n/language-context";

export function PlanFormDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: "", price: 0, duration_days: 30, commission_rate: 0, is_active: true },
  });

  async function onSubmit(values: PlanInput) {
    const result = await createPlan(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t.platformAdmin.planCreated);
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t.platformAdmin.newPlan}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.platformAdmin.newSubscriptionPlan}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.platformAdmin.planName}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.platformAdmin.planNamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.platformAdmin.price}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.platformAdmin.durationDays}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.platformAdmin.commissionPercent}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t.adminCommon.saving : t.platformAdmin.savePlan}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
