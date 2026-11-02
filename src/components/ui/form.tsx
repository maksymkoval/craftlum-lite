"use client";

import type { ComponentProps, ReactNode } from "react";
import { Checkbox as CheckboxPrimitive, Switch as SwitchPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  <label className={cn("text-[13px] font-medium", className)} {...props} />
);

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
};

/** Label + control + hint or error, with the error wired for screen readers. */
export const Field = ({ label, htmlFor, hint, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error ? (
      <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
        {error}
      </p>
    ) : hint ? (
      <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </p>
    ) : null}
  </div>
);

export const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea
    className={cn(
      "min-h-20 w-full rounded-md border border-input bg-card px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground",
      "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/30",
      className,
    )}
    {...props}
  />
);

export const Switch = ({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    className={cn(
      "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-card shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
  </SwitchPrimitive.Root>
);

type MeterProps = {
  value: number;
  max: number;
  label: string;
  className?: string;
  tone?: "default" | "warning" | "critical";
};

/** Horizontal meter; tone changes the fill, the caller always prints the number. */
export const Meter = ({ value, max, label, className, tone = "default" }: MeterProps) => (
  <div
    role="meter"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={value}
    className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
  >
    <div
      className={cn(
        "h-full rounded-full",
        tone === "default" && "bg-foreground",
        tone === "warning" && "bg-status-warning",
        tone === "critical" && "bg-status-critical",
      )}
      style={{ width: `${Math.min(value / max, 1) * 100}%` }}
    />
  </div>
);

export const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    className={cn(
      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-card data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <CheckIcon className="size-3 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
