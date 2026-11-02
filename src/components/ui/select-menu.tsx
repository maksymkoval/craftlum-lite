"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Option<T extends string> = { value: T; label: ReactNode; disabled?: boolean };

type SelectMenuProps<T extends string> = {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  align?: "start" | "end";
};

/** A compact single select: "Label value ▾". */
export const SelectMenu = <T extends string>({
  label,
  value,
  options,
  onChange,
  align = "start",
}: SelectMenuProps<T>) => {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`${label}: ${typeof selected?.label === "string" ? selected.label : value}`}
        >
          <span className="text-muted-foreground">{label}</span>
          <span>{selected?.label ?? value}</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const match = options.find((option) => option.value === next);
            if (match) onChange(match.value);
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
