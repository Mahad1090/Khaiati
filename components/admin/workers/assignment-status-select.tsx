"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAssignmentStatus } from "@/lib/actions/workers";
import { assignmentStatusLabels, assignmentStatuses, type AssignmentStatus } from "@/lib/validation/worker";
import { useLanguage } from "@/lib/i18n/language-context";

export function AssignmentStatusSelect({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: AssignmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t } = useLanguage();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await updateAssignmentStatus(assignmentId, value as AssignmentStatus);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(t.workers.assignmentStatusUpdated);
          router.refresh();
        });
      }}
    >
      <SelectTrigger className="w-[150px]" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {assignmentStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            {assignmentStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
