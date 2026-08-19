"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestPlan } from "@/lib/actions/subscriptions";

export function RequestPlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await requestPlan(planId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Plan requested — awaiting payment confirmation");
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Choose Plan"}
    </Button>
  );
}
