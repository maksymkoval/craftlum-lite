"use client";

import type { ReactNode } from "react";
import { ToggleGroup } from "radix-ui";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: ReactNode };

type SegmentedProps<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onValueChange: (value: T) => void;
  label: string;
  className?: string;
};

/** Single-choice segmented control built on Radix ToggleGroup. */
export const Segmented = <T extends string>({
  value,
  options,
  onValueChange,
  label,
  className,
}: SegmentedProps<T>) => (
  <ToggleGroup.Root
    type="single"
    value={value}
    aria-label={label}
    onValueChange={(next) => {
      const match = options.find((option) => option.value === next);
      if (match) onValueChange(match.value);
    }}
    className={cn("inline-flex h-8 items-center rounded-md border bg-card p-0.5", className)}
  >
    {options.map((option) => (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        className="flex h-full items-center gap-1.5 rounded-[5px] px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground data-[state=on]:bg-secondary data-[state=on]:font-medium data-[state=on]:text-foreground [&_svg]:size-3.5"
      >
        {option.label}
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
);
