"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { requestServiceOrder } from "@/lib/actions/customer-orders";
import { cdnImageUrl } from "@/lib/cdn";
import type { DesignRow } from "@/lib/actions/designs";
import type { ServiceRow } from "@/lib/actions/services";
import { garmentTypes, garmentTypeLabels, type GarmentType } from "@/lib/validation/design";
import { garmentMeasurementFields, measurementFieldLabels, type MeasurementFieldKey } from "@/lib/validation/measurements";
import { cn } from "@/lib/utils";

export type TailoringBusiness = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  services: ServiceRow[];
  designs: DesignRow[];
};

type ClothChoice = "own" | "need" | null;

/** A design row plus which tailor is offering it — designs live on a
 *  specific business, so once the customer picks one it pins the tailor. */
type AvailableDesign = DesignRow & { businessId: string; businessName: string };

const STEP_LABELS = ["Garment", "Cloth", "Design", "Tailor", "Measurements"] as const;

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
  const [designStepDone, setDesignStepDone] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup");
  const [note, setNote] = useState("");
  const [measurements, setMeasurements] = useState<Partial<Record<MeasurementFieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  // Any change to garment type or cloth choice invalidates everything
  // downstream, so the customer never submits a mismatched combination.
  useEffect(() => {
    setDesignStepDone(false);
    setSelectedBusinessId("");
    setSelectedDesignId("");
    setMeasurements({});
    setOrderNo(null);
  }, [garmentType, clothChoice]);

  // A service with no clothing_category set means the tailor offers that
  // service for ANY garment type — mirrors the server-side check in
  // requestServiceOrder (lib/actions/customer-orders.ts). Treating a blank
  // category as "matches nothing" was the bug that made this step say "no
  // approved tailors" even when tailors were live.
  const garmentTailors = useMemo(() => {
    if (!garmentType) return [];
    return businesses
      .map((business) => {
        const service = business.services.find(
          (item) => !item.clothing_category || item.clothing_category === garmentType
        );
        return service ? { ...business, service } : null;
      })
      .filter(Boolean) as Array<TailoringBusiness & { service: ServiceRow }>;
  }, [businesses, garmentType]);

  const availableDesigns = useMemo<AvailableDesign[]>(() => {
    if (!garmentType) return [];
    return garmentTailors.flatMap((business) =>
      business.designs
        .filter((design) => design.garment_type === garmentType)
        .map((design) => ({ ...design, businessId: business.id, businessName: business.name }))
    );
  }, [garmentTailors, garmentType]);

  // Once a design is picked it pins the tailor who published it (designs
  // are tailor-specific). Skipping the design step leaves every tailor
  // offering the garment type on the table.
  const tailorsForStep4 = useMemo(() => {
    if (selectedDesignId) {
      return garmentTailors.filter((tailor) => tailor.id === selectedBusinessId);
    }
    return garmentTailors;
  }, [garmentTailors, selectedBusinessId, selectedDesignId]);

  const selectedTailor = tailorsForStep4.find((tailor) => tailor.id === selectedBusinessId) ?? null;
  const selectedService = selectedTailor?.service ?? null;
  const selectedDesign = availableDesigns.find((design) => design.id === selectedDesignId) ?? null;
  const measurementFields = garmentType ? garmentMeasurementFields[garmentType] : [];

  const currentStep = orderNo
    ? 5
    : selectedTailor
    ? 5
    : designStepDone
    ? 4
    : clothChoice === "own" && garmentType
    ? 3
    : garmentType
    ? 2
    : 1;

  function pickDesign(design: AvailableDesign) {
    setSelectedDesignId(design.id);
    setSelectedBusinessId(design.businessId);
    setDesignStepDone(true);
  }

  function skipDesign() {
    setSelectedDesignId("");
    setSelectedBusinessId("");
    setDesignStepDone(true);
  }

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
      <StepIndicator currentStep={currentStep} />

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

      {/* Step 1 — garment type */}
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

      {/* Step 2 — own cloth or need cloth */}
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

      {/* Step 3 — design, shown BEFORE tailor selection */}
      {clothChoice === "own" && garmentType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Choose a design</CardTitle>
            <CardDescription>
              Pick a design you like and we'll take you straight to the tailor who made it — or skip this and browse tailors directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {garmentTailors.length === 0 ? (
              <NoTailorsForGarment garmentType={garmentType} />
            ) : availableDesigns.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No tailor has published a design for {garmentTypeLabels[garmentType].toLowerCase()} yet — that's fine, you
                  can describe what you want directly to the tailor in the next step.
                </p>
                <Button type="button" variant="outline" onClick={skipDesign}>
                  Continue to choose a tailor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableDesigns.map((design) => {
                    const imageUrl = cdnImageUrl(design.image_path);
                    const isSelected = selectedDesignId === design.id;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => pickDesign(design)}
                        className={cn(
                          "overflow-hidden rounded-xl border text-left transition-colors",
                          isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent"
                        )}
                      >
                        <div className="flex h-32 items-center justify-center bg-muted">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={design.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No image</span>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{design.name}</p>
                            {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
                          </div>
                          <p className="text-xs text-muted-foreground">by {design.businessName}</p>
                          {design.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{design.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button type="button" variant="ghost" onClick={skipDesign}>
                  Skip — I'll choose a tailor without picking a design first
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4 — tailor selection */}
      {designStepDone && clothChoice === "own" && garmentType && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">4. Choose a nearby tailor</CardTitle>
              {selectedDesign && (
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={skipDesign}>
                  Change design
                </Button>
              )}
            </div>
            {selectedDesign && (
              <CardDescription>
                Showing the tailor for "{selectedDesign.name}". Want to compare more tailors instead?{" "}
                <button type="button" className="underline underline-offset-2" onClick={skipDesign}>
                  See all tailors for {garmentTypeLabels[garmentType].toLowerCase()}
                </button>
                .
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {tailorsForStep4.length === 0 ? (
              <NoTailorsForGarment garmentType={garmentType} />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {tailorsForStep4.map((tailor) => (
                  <button
                    key={tailor.id}
                    type="button"
                    onClick={() => setSelectedBusinessId(tailor.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      selectedBusinessId === tailor.id ? "border-accent bg-accent/5" : "border-border hover:border-accent"
                    )}
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

      {/* Step 5 — measurements */}
      {selectedTailor && garmentType && clothChoice === "own" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">5. Fill measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{selectedTailor.name}</Badge>
              <Badge variant="secondary">{selectedService?.name}</Badge>
              <Badge variant="outline">{garmentTypeLabels[garmentType]}</Badge>
              {selectedDesign && <Badge variant="outline">Design: {selectedDesign.name}</Badge>}
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

/** Friendlier, actionable empty state — replaces the old dead-end
 *  "No approved tailors have published this garment type yet." line. */
function NoTailorsForGarment({ garmentType }: { garmentType: GarmentType }) {
  return (
    <div className="space-y-3 py-8 text-center">
      <p className="text-sm text-muted-foreground">
        We don't have an approved tailor offering {garmentTypeLabels[garmentType].toLowerCase()} stitching just yet.
      </p>
      <p className="text-sm text-muted-foreground">
        Try a different garment type above, or browse every tailor currently on Khaiati.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/businesses">Browse all tailors</Link>
      </Button>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium",
                isCurrent
                  ? "border-accent bg-accent text-accent-foreground"
                  : isDone
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-border text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3 w-3" /> : step}
            </span>
            <span className={cn(isCurrent ? "font-medium text-foreground" : undefined)}>{label}</span>
            {step < STEP_LABELS.length && <span className="mx-1 h-px w-4 bg-border sm:w-6" />}
          </li>
        );
      })}
    </ol>
  );
}