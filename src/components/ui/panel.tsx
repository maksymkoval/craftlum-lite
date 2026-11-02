import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel: the kit's one container. Deliberately flat — a hairline border on the
 * card surface, no shadow — so hierarchy comes from type and data, not chrome.
 */
export const Panel = ({ className, ...props }: ComponentProps<"section">) => (
  <section
    data-slot="panel"
    className={cn("rounded-lg border bg-card text-card-foreground", className)}
    {...props}
  />
);

type PanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const PanelHeader = ({ title, description, action, className }: PanelHeaderProps) => (
  <header className={cn("flex items-start justify-between gap-4 px-4 pt-4 pb-3", className)}>
    <div className="min-w-0">
      <h2 className="text-section-title">{title}</h2>
      {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
    </div>
    {action}
  </header>
);
