"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Ban, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBusinessStatus } from "@/lib/actions/businesses";
import type { BusinessStatus } from "@/lib/validation/business";
import { useLanguage } from "@/lib/i18n/language-context";

export function BusinessStatusActions({ id, status }: { id: string; status: BusinessStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t } = useLanguage();

  function setStatus(next: BusinessStatus) {
    startTransition(async () => {
      const result = await updateBusinessStatus(id, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${t.platformAdmin.businessStatusUpdated} ${next}`);
      router.refresh();
    });
  }

  if (pending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="flex gap-1">
      {status === "pending" && (
        <>
          <Button size="sm" variant="outline" onClick={() => setStatus("approved")}>
            <Check className="h-3.5 w-3.5" />
            {t.platformAdmin.approve}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus("rejected")}>
            <X className="h-3.5 w-3.5" />
            {t.platformAdmin.reject}
          </Button>
        </>
      )}
      {status === "approved" && (
        <Button size="sm" variant="ghost" onClick={() => setStatus("suspended")}>
          <Ban className="h-3.5 w-3.5" />
          {t.platformAdmin.suspend}
        </Button>
      )}
      {(status === "suspended" || status === "rejected") && (
        <Button size="sm" variant="outline" onClick={() => setStatus("approved")}>
          <RotateCcw className="h-3.5 w-3.5" />
          {t.platformAdmin.reinstate}
        </Button>
      )}
    </div>
  );
}
