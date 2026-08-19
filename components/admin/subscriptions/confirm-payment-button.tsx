"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmSubscriptionPayment } from "@/lib/actions/subscriptions";

export function ConfirmPaymentButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await confirmSubscriptionPayment(id);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Payment confirmed");
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      Confirm Payment
    </Button>
  );
}
