"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { requestServiceOrder, requestProductOrder } from "@/lib/actions/customer-orders";

export function RequestOrderDialog({
  kind,
  id,
  name,
  isSignedIn,
}: {
  kind: "service" | "product";
  id: string;
  name: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">("pickup");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    try {
      const action = kind === "service" ? requestServiceOrder : requestProductOrder;
      const result = await action(id, { quantity, delivery_option: deliveryOption, note });
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
      <DialogContent>
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
                <Link href="/account/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/account/register">Create Account</Link>
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
          <div className="space-y-4">
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
            <div>
              <Label>Note (optional)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
