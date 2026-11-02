"use client";

import { useState } from "react";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROJECTS = ["Acme Support", "Ledger AI", "Internal tools"] as const;
const ENVIRONMENTS = ["production", "staging"] as const;

export const ProjectSwitcher = () => {
  const [project, setProject] = useState<string>(PROJECTS[0]);
  const [environment, setEnvironment] = useState<string>(ENVIRONMENTS[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm whitespace-nowrap hover:bg-accent">
        <span className="truncate font-medium">{project}</span>
        <span className="hidden rounded border px-1.5 text-xs text-muted-foreground sm:inline">
          {environment}
        </span>
        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={project} onValueChange={setProject}>
          {PROJECTS.map((name) => (
            <DropdownMenuRadioItem key={name} value={name}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Environment</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={environment} onValueChange={setEnvironment}>
          {ENVIRONMENTS.map((name) => (
            <DropdownMenuRadioItem key={name} value={name}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <PlusIcon /> New project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
