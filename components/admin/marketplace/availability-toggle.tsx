"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function AvailabilityToggle({
  id,
  isAvailable,
  action,
}: {
  id: string;
  isAvailable: boolean;
  action: (id: string, isAvailable: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={isAvailable}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await action(id, checked);
          if (!result.ok) {
            toast.error(result.error ?? "Could not update.");
            return;
          }
          router.refresh();
        })
      }
    />
  );
}
