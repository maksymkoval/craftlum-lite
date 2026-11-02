"use client";

import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List className={cn("flex gap-5 overflow-x-auto border-b", className)} {...props} />
);

export const TabsTrigger = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "-mb-px border-b-2 border-transparent pb-2.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
      "data-[state=active]:border-foreground data-[state=active]:font-medium data-[state=active]:text-foreground",
      className,
    )}
    {...props}
  />
);

export const TabsContent = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("pt-6 outline-none", className)} {...props} />
);
