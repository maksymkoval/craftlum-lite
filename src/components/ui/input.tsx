import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Input = ({ className, type = "text", ...props }: ComponentProps<"input">) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      "h-8 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-sm transition-[border-color] outline-none placeholder:text-muted-foreground",
      "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);
