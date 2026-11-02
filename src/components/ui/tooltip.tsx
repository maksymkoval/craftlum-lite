"use client";

import type { ComponentProps } from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export const TooltipProvider = ({
  delayDuration = 150,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md shadow-black/5",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
