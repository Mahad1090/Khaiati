"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitReview } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  orderId,
  businessName,
  triggerLabel,
}: {
  orderId: string;
  businessName: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      const result = await submitReview(orderId, { rating, comment });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Thank you! Your review will appear once the store approves it.");
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {triggerLabel ?? "Leave a Review"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Review — {businessName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={cn("h-7 w-7", n <= rating ? "fill-accent text-accent" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="How was your experience? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
