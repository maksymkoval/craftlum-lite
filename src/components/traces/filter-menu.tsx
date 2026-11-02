"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FilterOption<T extends string> = { value: T; label: ReactNode };

type FilterMenuProps<T extends string> = {
  label: string;
  value: T | "all";
  options: readonly FilterOption<T>[];
  onChange: (value: T | "all") => void;
};

/** A dimension filter: shows "Label" when unset, "Label: value" when set. */
export const FilterMenu = <T extends string>({ label, value, options, onChange }: FilterMenuProps<T>) => {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(selected && "border-foreground/30")}>
          <span className={cn(selected && "text-muted-foreground")}>{label}</span>
          {selected ? <span className="max-w-36 truncate">{selected.label}</span> : null}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const match = options.find((option) => option.value === next);
            onChange(match ? match.value : "all");
          }}
        >
          <DropdownMenuRadioItem value="all">Any {label.toLowerCase()}</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
