"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarContent } from "./app-sidebar";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
          <MenuIcon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
          onClick={(event) => {
            if (event.target instanceof HTMLElement && event.target.closest("a")) setOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3"
              aria-label="Close navigation"
            >
              <XIcon />
            </Button>
          </Dialog.Close>
          <SidebarContent />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
