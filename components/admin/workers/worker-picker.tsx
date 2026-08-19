"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, HardHat } from "lucide-react";
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
import { searchWorkers, type WorkerRow } from "@/lib/actions/workers";
import { useLanguage } from "@/lib/i18n/language-context";

export function WorkerPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, worker: WorkerRow) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkerRow[]>([]);
  const [selected, setSelected] = useState<WorkerRow | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      searchWorkers(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2">
              <HardHat className="h-4 w-4" />
              {selected.name} · {selected.worker_no}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.workers.searchWorkerPlaceholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.workers.searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{t.workers.noneFound}</CommandEmpty>
            <CommandGroup>
              {results.map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.id}
                  onSelect={() => {
                    setSelected(w);
                    onChange(w.id, w);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === w.id ? "opacity-100" : "opacity-0")} />
                  <span>
                    {w.name} · {w.worker_no}
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
