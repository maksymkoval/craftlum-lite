import { BellIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { ProjectSwitcher } from "./project-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export const Topbar = () => (
  <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md md:px-6">
    <MobileNav />
    <ProjectSwitcher />
    <div className="ml-auto flex items-center gap-1">
      <Button variant="outline" size="sm" className="hidden w-56 justify-start text-muted-foreground md:flex">
        <SearchIcon />
        Search traces
        <kbd className="ml-auto rounded border px-1 font-mono text-[11px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Search traces">
        <SearchIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Notifications">
        <BellIcon />
      </Button>
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);
