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
import { updateOrderStatus } from "@/lib/actions/orders";
import { orderStatusLabels, orderStatuses, type OrderStatus } from "@/lib/validation/order";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, value as OrderStatus);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Status updated");
          router.refresh();
        });
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {orderStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            {orderStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
