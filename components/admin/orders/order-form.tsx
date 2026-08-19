"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerPicker } from "@/components/admin/orders/customer-picker";
import {
  orderSchema,
  type OrderInput,
  orderKinds,
  orderKindLabels,
  deliveryOptions,
  deliveryOptionLabels,
} from "@/lib/validation/order";
import { garmentTypeLabels, garmentTypes } from "@/lib/validation/design";
import {
  garmentMeasurementFields,
  measurementFieldLabels,
} from "@/lib/validation/measurements";
import { createOrder } from "@/lib/actions/orders";
import { formatMoney } from "@/lib/format";
import type { CustomerRow } from "@/lib/actions/customers";
import type { DesignRow } from "@/lib/actions/designs";

const emptyItem = {
  garment_type: "shirt" as const,
  design_id: "",
  quantity: 1,
  price_per_piece: 0,
  note: "",
  measurements: {},
};

export function OrderForm({
  designs,
  initialCustomer,
}: {
  designs: DesignRow[];
  initialCustomer?: CustomerRow | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: initialCustomer?.id ?? "",
      order_date: new Date().toISOString().slice(0, 10),
      due_date: "",
      note: "",
      items: [emptyItem],
      paid_amount: 0,
      order_kind: "stitching",
      delivery_option: "pickup",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");
  const paidAmount = form.watch("paid_amount");

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price_per_piece) || 0),
        0
      ),
    [items]
  );
  const balance = totalPrice - (Number(paidAmount) || 0);

  async function onSubmit(values: OrderInput) {
    setSubmitting(true);
    try {
      const result = await createOrder(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Order ${result.data.order_no} created`);
      router.push(`/admin/orders/${result.data.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerPicker
                      value={field.value}
                      initialCustomer={initialCustomer}
                      onChange={(id) => field.onChange(id)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order_kind"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Order Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orderKinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {orderKindLabels[k]}
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
              name="delivery_option"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deliveryOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {deliveryOptionLabels[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {fields.map((field, index) => {
          const garmentType = items[index]?.garment_type ?? "shirt";
          const measurementFields = garmentMeasurementFields[garmentType];
          const relevantDesigns = designs.filter((d) => d.garment_type === garmentType);
          const itemTotal =
            (Number(items[index]?.quantity) || 0) * (Number(items[index]?.price_per_piece) || 0);

          return (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Garment {index + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.garment_type`}
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
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.design_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Design</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relevantDesigns.length === 0 && (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No designs for this garment type
                              </div>
                            )}
                            {relevantDesigns.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.price_per_piece`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Piece</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Item total: <span className="text-foreground">{formatMoney(itemTotal)}</span>
                </p>

                <div>
                  <p className="mb-2 text-sm font-medium">Measurements</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {measurementFields.map((key) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`items.${index}.measurements.${key}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              {measurementFieldLabels[key]}
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min={0} step="0.1" {...field} value={field.value ?? ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name={`items.${index}.measurements.note`}
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormLabel className="text-xs">Measurement Note</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.note`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Garment Note</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => append(emptyItem)}
        >
          <Plus className="h-4 w-4" />
          Add Garment
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financials</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="font-serif text-xl">{formatMoney(totalPrice)}</p>
            </div>
            <FormField
              control={form.control}
              name="paid_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Amount</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-serif text-xl">{formatMoney(balance)}</p>
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Order Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Order"}
        </Button>
      </form>
    </Form>
  );
}
