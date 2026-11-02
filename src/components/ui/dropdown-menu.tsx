"use client";

import type { ComponentProps } from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-48 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent",
      className,
    )}
    {...props}
  >
    {children}
    <span className="absolute right-2 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="size-4 stroke-[2.5]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  </DropdownMenuPrimitive.RadioItem>
);

export const DropdownMenuLabel = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
  <DropdownMenuPrimitive.Label
    className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
);
