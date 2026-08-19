"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Scissors } from "lucide-react";
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
import { listFabrics, type FabricRow } from "@/lib/actions/fabrics";
import { useLanguage } from "@/lib/i18n/language-context";

export function FabricPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, fabric: FabricRow) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FabricRow[]>([]);
  const [selected, setSelected] = useState<FabricRow | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      listFabrics({ search: query }).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              {selected.name} · {selected.fabric_no}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.fabrics.searchFabricPlaceholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.fabrics.searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t.fabrics.noneFound}</CommandEmpty>
            <CommandGroup>
              {results.map((f) => (
                <CommandItem
                  key={f.id}
                  value={f.id}
                  onSelect={() => {
                    setSelected(f);
                    onChange(f.id, f);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === f.id ? "opacity-100" : "opacity-0")} />
                  <span>
                    {f.name} · {f.fabric_no} {f.color ? `· ${f.color}` : ""}
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
