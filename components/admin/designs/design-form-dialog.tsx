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
import { ImageCropUploader } from "@/components/admin/image-crop-uploader";
import { designSchema, type DesignInput } from "@/lib/validation/design";
import { garmentTypeLabels, garmentTypes } from "@/lib/validation/design";
import { createDesign, updateDesign } from "@/lib/actions/designs";
import { cdnImageUrl } from "@/lib/cdn";

type Props = {
  mode?: "create" | "edit";
  designId?: string;
  defaultValues?: Partial<DesignInput>;
  trigger?: React.ReactNode;
};

export function DesignFormDialog({ mode = "create", designId, defaultValues, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<DesignInput>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      garment_type: defaultValues?.garment_type ?? "shirt",
      description: defaultValues?.description ?? "",
      image_path: defaultValues?.image_path ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  async function onSubmit(values: DesignInput) {
    const result =
      mode === "edit" && designId
        ? await updateDesign(designId, values)
        : await createDesign(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "edit" ? "Design updated" : "Design added");
    setOpen(false);
    form.reset();
    router.refresh();
  }

  const imagePath = form.watch("image_path");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" />
            New Design
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Design" : "New Design"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ImageCropUploader
              previewUrl={cdnImageUrl(imagePath)}
              onUploaded={(path) => form.setValue("image_path", path)}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Design name" {...field} />
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
                  <FormLabel>Garment Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
