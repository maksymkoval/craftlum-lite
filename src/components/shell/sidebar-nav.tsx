"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DEMO_URL, NAV, type NavItem } from "./nav";

const NavEntry = ({ item, active }: { item: NavItem; active: boolean }) => {
  const Icon = item.icon;
  const base = "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] transition-colors [&_svg]:size-4";

  if (item.pro) {
    return (
      <a
        href={`${DEMO_URL}${item.href}`}
        title={`${item.label} is in the full version. Opens the live demo.`}
        className={cn(
          base,
          "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-sm border px-1 text-[10.5px] leading-4 text-sidebar-foreground/60">Pro</span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        "relative outline-offset-[-2px]",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:top-1.5 before:bottom-1.5 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-sidebar-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon />
      {item.label}
    </Link>
  );
};

export const SidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-2 text-xs text-sidebar-foreground/60">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavEntry
                  item={item}
                  active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};
