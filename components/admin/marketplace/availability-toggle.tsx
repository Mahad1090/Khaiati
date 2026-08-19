"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t } = useLanguage();

  return (
    <Switch
      checked={isAvailable}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await action(id, checked);
          if (!result.ok) {
            toast.error(result.error ?? t.marketplace.couldNotUpdate);
            return;
          }
          router.refresh();
        })
      }
    />
  );
}
