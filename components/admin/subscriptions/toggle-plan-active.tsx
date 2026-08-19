"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setPlanActive } from "@/lib/actions/subscriptions";

export function TogglePlanActive({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await setPlanActive(id, checked);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          router.refresh();
        })
      }
    />
  );
}
