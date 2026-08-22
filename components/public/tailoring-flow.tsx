"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { requestServiceOrder } from "@/lib/actions/customer-orders";
import type { DesignRow } from "@/lib/actions/designs";
import type { ServiceRow } from "@/lib/actions/services";
import { garmentTypes, garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { garmentMeasurementFields, measurementFieldLabels, type MeasurementFieldKey } from "@/lib/validation/measurements";

export type TailoringBusiness = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  services: ServiceRow[];
  designs: DesignRow[];
};

type ClothChoice = "own" | "need" | null;

export function TailoringFlow({
  businesses,
  isSignedIn,
}: {
  businesses: TailoringBusiness[];
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [garmentType, setGarmentType] = useState<GarmentType | "">("");
  const [clothChoice, setClothChoice] = useState<ClothChoice>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup");
  const [note, setNote] = useState("");
  const [measurements, setMeasurements] = useState<Partial<Record<MeasurementFieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBusinessId("");
    setSelectedDesignId("");
    setMeasurements({});
    setOrderNo(null);
  }, [garmentType, clothChoice]);

  const availableTailors = useMemo(() => {
    if (!garmentType) return [];
    return businesses
      .map((business) => {
        const service = business.services.find((item) => item.clothing_category === garmentType);
        return service ? { ...business, service } : null;
      })
      .filter(Boolean) as Array<TailoringBusiness & { service: ServiceRow }>;
  }, [businesses, garmentType]);

  const selectedTailor = availableTailors.find((tailor) => tailor.id === selectedBusinessId) ?? null;
  const selectedService = selectedTailor?.service ?? null;
  const selectedDesigns = useMemo(
    () => (selectedTailor ? selectedTailor.designs.filter((design) => design.garment_type === garmentType) : []),
    [selectedTailor, garmentType]
  );
  const measurementFields = garmentType ? garmentMeasurementFields[garmentType] : [];

  async function submit() {
    if (!isSignedIn) {
      toast.error("Please sign in first.");
      return;
    }
    if (!garmentType) {
      toast.error("Please select a garment type.");
      return;
    }
    if (clothChoice !== "own") {
      toast.error("This flow is only for customers who already have cloth.");
      return;
    }
    if (!selectedService) {
      toast.error("Please select a tailor.");
      return;
    }
    if (selectedDesigns.length > 0 && !selectedDesignId) {
      toast.error("Please select a design.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestServiceOrder(selectedService.id, {
        garment_type: garmentType,
        design_id: selectedDesignId,
        quantity,
        delivery_option: deliveryOption,
        note,
        measurements: { ...measurements, note },
      });
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
    <div className="space-y-8">
      {orderNo ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-serif text-xl">Request sent.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Order <span className="font-medium text-foreground">{orderNo}</span> has been submitted to the selected tailor.
            </p>
            <Button asChild className="mt-6">
              <Link href="/account">View My Orders</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Select garment type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {garmentTypes.map((type) => (
            <Button
              key={type}
              type="button"
              variant={garmentType === type ? "default" : "outline"}
              className="h-auto py-4"
              onClick={() => setGarmentType(type)}
            >
              {garmentTypeLabels[type]}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className={garmentType ? "" : "opacity-60"}>
        <CardHeader>
          <CardTitle className="text-base">2. Do you have cloth already?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" variant={clothChoice === "own" ? "default" : "outline"} onClick={() => setClothChoice("own")} disabled={!garmentType}>
            I have cloth
          </Button>
          <Button type="button" variant={clothChoice === "need" ? "default" : "outline"} onClick={() => setClothChoice("need")} disabled={!garmentType}>
            I need cloth from the tailor
          </Button>
        </CardContent>
      </Card>

      {clothChoice === "need" && (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            The cloth purchase flow will be added next. For now, continue with "I have cloth" to place a tailoring order.
          </CardContent>
        </Card>
      )}

      {clothChoice === "own" && garmentType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Choose a tailor</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTailors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved tailors have published this garment type yet.</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {availableTailors.map((tailor) => (
                  <button
                    key={tailor.id}
                    type="button"
                    onClick={() => {
                      setSelectedBusinessId(tailor.id);
                      setSelectedDesignId("");
                    }}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selectedBusinessId === tailor.id ? "border-accent bg-accent/5" : "border-border hover:border-accent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-lg">{tailor.name}</h3>
                        {tailor.location && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {tailor.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{tailor.service.name}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{tailor.service.description ?? "Custom tailoring service"}</p>
                    <p className="mt-2 font-serif text-lg text-accent">{tailor.service.price}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTailor && garmentType && clothChoice === "own" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. Fill measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{selectedTailor.name}</Badge>
              <Badge variant="secondary">{selectedService?.name}</Badge>
              <Badge variant="outline">{garmentTypeLabels[garmentType]}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Quantity</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <Label>Delivery</Label>
                <Select value={deliveryOption} onValueChange={(value) => setDeliveryOption(value as "pickup" | "delivery") }>
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

            {selectedDesigns.length > 0 && (
              <div>
                <Label>Design</Label>
                <Select value={selectedDesignId} onValueChange={setSelectedDesignId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a design" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDesigns.map((design) => (
                      <SelectItem key={design.id} value={design.id}>
                        {design.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            <div>
              <Label>Note (optional)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <Button onClick={submit} disabled={submitting || !selectedService}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit order"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
