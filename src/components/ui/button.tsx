import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-2.5 text-[13px]",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
};
