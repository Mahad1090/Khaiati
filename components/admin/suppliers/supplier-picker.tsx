"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Truck } from "lucide-react";
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
import { searchSuppliers, type SupplierRow } from "@/lib/actions/suppliers";
import { useLanguage } from "@/lib/i18n/language-context";

export function SupplierPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, supplier: SupplierRow) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SupplierRow[]>([]);
  const [selected, setSelected] = useState<SupplierRow | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      searchSuppliers(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {selected.company_name}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.suppliers.searchSupplierPlaceholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.suppliers.searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t.suppliers.noneFound}</CommandEmpty>
            <CommandGroup>
              {results.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.id}
                  onSelect={() => {
                    setSelected(s);
                    onChange(s.id, s);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")} />
                  <span>
                    {s.company_name} · {s.supplier_no}
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
