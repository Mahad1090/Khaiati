"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeTeamMember } from "@/lib/actions/team";
import { useLanguage } from "@/lib/i18n/language-context";

export function RemoveTeamMemberButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t } = useLanguage();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm(t.platformAdmin.confirmRemoveTeamMember)) return;
        startTransition(async () => {
          const result = await removeTeamMember(userId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(t.platformAdmin.teamMemberRemoved);
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
