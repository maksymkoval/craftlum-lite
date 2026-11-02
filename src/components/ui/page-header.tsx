import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small line above the title, e.g. a breadcrumb or entity type. */
  eyebrow?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, description, actions, eyebrow, className }: PageHeaderProps) => (
  <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
    <div className="min-w-0">
      {eyebrow ? <div className="mb-2 text-[13px] text-muted-foreground">{eyebrow}</div> : null}
      <h1 className="text-page-title">{title}</h1>
      {description ? (
        <p className="mt-1.5 max-w-[68ch] text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);

type SectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** A titled group of content sitting on the page background, without a card. */
export const Section = ({ title, description, actions, children, className }: SectionProps) => (
  <section className={cn("flex flex-col gap-3", className)}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-section-title">{title}</h2>
        {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
    {children}
  </section>
);
