"use client";

import { Slider } from "@/components/ui/slider";
import { YEAR_MAX, YEAR_MIN } from "@/lib/constants";

interface Props {
  value: number;
  onChange: (year: number) => void;
}

export default function YearSlider({ value, onChange }: Props) {
  return (
    <div className="flex min-w-56 flex-1 flex-col gap-1 sm:max-w-80">
      <span id="label-tahun" className="text-xs font-medium text-muted-foreground">
        Tahun: <strong className="text-sm text-foreground tabular-nums">{value}</strong>
      </span>
      <div className="flex h-9 items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">{YEAR_MIN}</span>
        <Slider
          aria-labelledby="label-tahun"
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          value={[value]}
          onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        />
        <span className="text-xs text-muted-foreground tabular-nums">{YEAR_MAX}</span>
      </div>
    </div>
  );
}
