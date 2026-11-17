"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDICATORS } from "@/lib/indicators";

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  id: string;
}

export default function IndicatorSelect<T extends string>({ label, options, value, onChange, id }: Props<T>) {
  const items = options.map((o) => ({ value: o, label: INDICATORS[o]?.label ?? o }));
  return (
    <div className="flex flex-col gap-1">
      <span id={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <Select
        items={items}
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as T);
        }}
      >
        <SelectTrigger aria-labelledby={id} className="h-9! w-64 max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
