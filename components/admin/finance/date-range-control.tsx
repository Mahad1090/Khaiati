"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function presetRange(preset: "today" | "week" | "month" | "year") {
  const now = new Date();
  const end = toISODate(now);
  let start: Date;
  switch (preset) {
    case "today":
      start = now;
      break;
    case "week": {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      break;
    }
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }
  return { from: toISODate(start), to: end };
}

export function DateRangeControl({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(newFrom: string, newTo: string) {
    router.push(`${pathname}?from=${newFrom}&to=${newTo}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <Label className="text-xs">From</Label>
        <Input type="date" value={from} onChange={(e) => navigate(e.target.value, to)} />
      </div>
      <div>
        <Label className="text-xs">To</Label>
        <Input type="date" value={to} onChange={(e) => navigate(from, e.target.value)} />
      </div>
      <div className="flex gap-2">
        {(["today", "week", "month", "year"] as const).map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const r = presetRange(p);
              navigate(r.from, r.to);
            }}
          >
            {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
          </Button>
        ))}
      </div>
    </div>
  );
}
