"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ACCENT } from "@/lib/colors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  regions: { kode: string; nama: string }[];
  value: string;
  onChange: (kode: string) => void;
}

export default function RegionSelect({ regions, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = regions.find((r) => r.kode === value);

  return (
    <div className="flex flex-col gap-1">
      <span id="label-wilayah" className="text-xs font-medium text-muted-foreground">
        Kabupaten/kota
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-labelledby="label-wilayah"
              className="h-9 w-56 justify-between font-normal"
            />
          }
        >
          <span className="flex items-center gap-2 truncate">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: ACCENT }} />
            {current?.nama ?? "Pilih kab/kota"}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Cari kab/kota…" />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {regions.map((r) => (
                  <CommandItem
                    key={r.kode}
                    value={r.nama}
                    data-checked={r.kode === value}
                    onSelect={() => {
                      onChange(r.kode);
                      setOpen(false);
                    }}
                  >
                    {r.nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
