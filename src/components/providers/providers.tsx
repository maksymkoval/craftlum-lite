"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "@/components/ui/tooltip";

export const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>{children}</TooltipProvider>
  </ThemeProvider>
);
