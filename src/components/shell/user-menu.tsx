"use client";

import { KeyRoundIcon, LogOutIcon, SettingsIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_URL } from "./nav";

/** Settings, API keys and auth ship in the full version; here they open the live demo. */

export const UserMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label="Account menu for Maya Lin"
      className="ml-1 flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold hover:ring-2 hover:ring-border"
    >
      ML
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="text-foreground">
        <span className="block text-sm font-medium">Maya Lin</span>
        <span className="block text-xs font-normal text-muted-foreground">maya@acme.example</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href={`${DEMO_URL}/settings/`}>
          <SettingsIcon /> Settings
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={`${DEMO_URL}/api-keys/`}>
          <KeyRoundIcon /> API keys
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href={`${DEMO_URL}/login/`}>
          <LogOutIcon /> Log out
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
