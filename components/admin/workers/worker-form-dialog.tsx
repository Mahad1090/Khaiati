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
import { workerSchema, type WorkerInput } from "@/lib/validation/worker";
import { createWorker, updateWorker } from "@/lib/actions/workers";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  mode?: "create" | "edit";
  workerId?: string;
  defaultValues?: Partial<WorkerInput>;
  trigger?: React.ReactNode;
};

export function WorkerFormDialog({ mode = "create", workerId, defaultValues, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<WorkerInput>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      occupation: defaultValues?.occupation ?? "",
      contact_number: defaultValues?.contact_number ?? "",
      employee_number: defaultValues?.employee_number ?? "",
      salary: defaultValues?.salary ?? undefined,
      note: defaultValues?.note ?? "",
    },
  });

  async function onSubmit(values: WorkerInput) {
    const result = mode === "edit" && workerId ? await updateWorker(workerId, values) : await createWorker(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? t.workers.workerUpdated : t.workers.workerAdded);
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
            {t.workers.newWorker}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? t.workers.editWorker : t.workers.newWorker}</DialogTitle>
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
                    <Input placeholder={t.workers.workerName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.workers.occupation}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tailor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.workers.employeeNo}</FormLabel>
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
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.workers.contactNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.workers.baseSalary}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} value={field.value ?? ""} />
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
