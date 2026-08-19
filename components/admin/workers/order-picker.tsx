"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchOrders, type OrderListRow } from "@/lib/actions/orders";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  value: string;
  onChange: (id: string, order: OrderListRow) => void;
};

/** Search/select an order by order number or customer, per the "enter/search order number" assignment workflow. */
export function OrderPicker({ value, onChange }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrderListRow[]>([]);
  const [selected, setSelected] = useState<OrderListRow | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      searchOrders(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {selected.order_no} · {selected.customer_name}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.workers.searchOrderPlaceholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.orders.searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t.orders.noneFound}</CommandEmpty>
            <CommandGroup>
              {results.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.id}
                  onSelect={() => {
                    setSelected(o);
                    onChange(o.id, o);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === o.id ? "opacity-100" : "opacity-0")} />
                  <span>
                    {o.order_no} · {o.customer_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
