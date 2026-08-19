"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestPlan } from "@/lib/actions/subscriptions";
import { useLanguage } from "@/lib/i18n/language-context";

export function RequestPlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t } = useLanguage();

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
          toast.success(t.platformAdmin.planRequested);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t.platformAdmin.choosePlan}
    </Button>
  );
}
