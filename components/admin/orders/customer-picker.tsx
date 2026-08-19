"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
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
import { searchCustomers, type CustomerRow } from "@/lib/actions/customers";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  value: string;
  onChange: (id: string, customer: CustomerRow) => void;
  initialCustomer?: CustomerRow | null;
};

export function CustomerPicker({ value, onChange, initialCustomer }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerRow[]>(
    initialCustomer ? [initialCustomer] : []
  );
  const [selected, setSelected] = useState<CustomerRow | null>(initialCustomer ?? null);
  const { t } = useLanguage();

  useEffect(() => {
    const handle = setTimeout(() => {
      searchCustomers(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selected.name} · {selected.phone}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.orders.searchCustomerPlaceholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.customers.searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t.customers.noneFound}</CommandEmpty>
            <CommandGroup>
              {results.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    setSelected(c);
                    onChange(c.id, c);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")}
                  />
                  <span>
                    {c.name} · {c.phone} · {c.customer_no}
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
