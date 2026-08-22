"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requestServiceOrder, requestProductOrder } from "@/lib/actions/customer-orders";
import type { DesignRow } from "@/lib/actions/designs";
import { garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { garmentMeasurementFields, measurementFieldLabels, type MeasurementFieldKey } from "@/lib/validation/measurements";

export function RequestOrderDialog({
  kind,
  id,
  name,
  isSignedIn,
  garmentType,
  designs,
}: {
  kind: "service" | "product";
  id: string;
  name: string;
  isSignedIn: boolean;
  garmentType?: GarmentType | null;
  designs?: DesignRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const nextParam = `?next=${encodeURIComponent(pathname)}`;
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup");
  const [note, setNote] = useState("");
  const [designId, setDesignId] = useState("");
  const [measurements, setMeasurements] = useState<Partial<Record<MeasurementFieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  const isTailoringRequest = kind === "service" && Boolean(garmentType);
  const availableDesigns = useMemo(
    () => (isTailoringRequest ? (designs ?? []).filter((design) => design.garment_type === garmentType) : []),
    [designs, garmentType, isTailoringRequest]
  );
  const measurementFields = garmentType ? garmentMeasurementFields[garmentType] : [];

  async function submit() {
    if (isTailoringRequest && !designId) {
      toast.error("Please select a design.");
      return;
    }

    setSubmitting(true);
    try {
      const action = kind === "service" ? requestServiceOrder : requestProductOrder;
      const payload = isTailoringRequest
        ? {
            garment_type: garmentType,
            design_id: designId,
            quantity,
            delivery_option: deliveryOption,
            note,
            measurements: { ...measurements, note },
          }
        : { quantity, delivery_option: deliveryOption, note };
      const result = await action(id, payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOrderNo(result.data.orderNo);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setOrderNo(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Request — {name}</DialogTitle>
          {!isSignedIn && (
            <DialogDescription>
              You&apos;ll need an account to request an order.
            </DialogDescription>
          )}
        </DialogHeader>

        {!isSignedIn ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Sign in or create a free account to continue.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href={`/account/login${nextParam}`}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href={`/account/register${nextParam}`}>Create Account</Link>
              </Button>
            </div>
          </div>
        ) : orderNo ? (
          <div className="py-6 text-center">
            <p className="font-serif text-lg">Request sent.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Order <span className="font-medium text-foreground">{orderNo}</span> — the business will follow up.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/account">View My Orders</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {isTailoringRequest && garmentType && (
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 pt-6">
                  <span className="text-sm text-muted-foreground">Garment type</span>
                  <Badge variant="outline">{garmentTypeLabels[garmentType]}</Badge>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Quantity</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <Label>Delivery</Label>
                <Select value={deliveryOption} onValueChange={(v) => setDeliveryOption(v as "pickup" | "delivery")}> 
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isTailoringRequest && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                <div>
                  <Label>Design</Label>
                  <Select value={designId} onValueChange={setDesignId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a design" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDesigns.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No designs available
                        </SelectItem>
                      ) : (
                        availableDesigns.map((design) => (
                          <SelectItem key={design.id} value={design.id}>
                            {design.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {availableDesigns.length === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      This tailor has not published any designs for this garment yet.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Measurements</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {measurementFields.map((field) => (
                      <div key={field}>
                        <Label className="text-xs">{measurementFieldLabels[field]}</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.1"
                          value={measurements[field] ?? ""}
                          onChange={(e) =>
                            setMeasurements((current) => ({
                              ...current,
                              [field]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Note (optional)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <DialogFooter>
              <Button onClick={submit} disabled={submitting || (isTailoringRequest && availableDesigns.length === 0)}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
