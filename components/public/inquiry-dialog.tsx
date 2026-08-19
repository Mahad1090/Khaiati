"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { inquirySchema, type InquiryInput } from "@/lib/validation/public-site";
import { garmentTypeLabels, garmentTypes } from "@/lib/validation/design";
import { submitInquiry } from "@/lib/actions/public-site";

export function InquiryDialog({
  trigger,
  title = "Book a Fitting",
}: {
  trigger: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", phone: "", garment_type: "", message: "" },
  });

  async function onSubmit(values: InquiryInput) {
    const result = await submitInquiry(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSent(true);
    form.reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSent(false);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
          <DialogDescription>
            Leave your details and we&apos;ll reach out to schedule your fitting.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center">
            <p className="font-serif text-lg">Thank you.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve received your request and will contact you shortly.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="garment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garment (optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a garment type" />
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Anything we should know?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
