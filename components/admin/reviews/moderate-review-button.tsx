"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moderateReview } from "@/lib/actions/reviews";

export function ModerateReviewButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isPublished = status === "published";

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await moderateReview(id, isPublished ? "hidden" : "published");
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          router.refresh();
        })
      }
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPublished ? (
        <EyeOff className="h-3.5 w-3.5" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      {isPublished ? "Hide" : "Publish"}
    </Button>
  );
}
