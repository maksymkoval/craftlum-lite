"use client";

import type { ComponentProps, ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
    <DialogPrimitive.Content
      className={cn(
        "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-popover p-5 text-popover-foreground shadow-xl shadow-black/10",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute top-3.5 right-3.5 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Close"
      >
        <XIcon className="size-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({ title, description }: { title: string; description?: ReactNode }) => (
  <div className="pr-6">
    <DialogPrimitive.Title className="text-section-title">{title}</DialogPrimitive.Title>
    {description ? (
      <DialogPrimitive.Description className="mt-1 text-[13px] text-muted-foreground">
        {description}
      </DialogPrimitive.Description>
    ) : (
      <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
    )}
  </div>
);

export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
