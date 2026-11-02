import type { ReactNode } from "react";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Pin } from "./pin";

export type InsightTone = "good" | "bad" | "warning" | "neutral";

export type Insight = {
  id: string;
  tone: InsightTone;
  /** Short claim, read first. */
  headline: ReactNode;
  /** One sentence of evidence or cause. */
  detail?: ReactNode;
  /** Links this insight to a numbered marker on a chart. */
  pin?: number;
};

const TONE = {
  good: { icon: CircleCheckIcon, className: "text-status-good-text", label: "Improving" },
  bad: { icon: CircleAlertIcon, className: "text-destructive", label: "Needs attention" },
  warning: { icon: TriangleAlertIcon, className: "text-status-warning-text", label: "Watch" },
  neutral: { icon: InfoIcon, className: "text-muted-foreground", label: "Note" },
} as const;

/**
 * Briefing: what changed and why, before any chart. Each item is a claim plus
 * evidence; tone is carried by icon and label, never color alone.
 */
export const Briefing = ({ insights, className }: { insights: Insight[]; className?: string }) => (
  <ul
    aria-label="Briefing"
    className={cn(
      "grid divide-y rounded-lg border bg-card md:divide-x md:divide-y-0",
      insights.length >= 3 ? "md:grid-cols-3" : insights.length === 2 ? "md:grid-cols-2" : "",
      className,
    )}
  >
    {insights.map((insight) => {
      const tone = TONE[insight.tone];
      const Icon = tone.icon;
      return (
        <li key={insight.id} className="flex gap-3 p-4">
          <Icon className={cn("mt-0.5 size-4 shrink-0", tone.className)} aria-label={tone.label} />
          <div className="min-w-0">
            <p className="text-[14.5px] leading-snug font-medium text-pretty">
              {insight.headline}
              {insight.pin ? <Pin n={insight.pin} className="ml-1.5" /> : null}
            </p>
            {insight.detail ? (
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground text-pretty">
                {insight.detail}
              </p>
            ) : null}
          </div>
        </li>
      );
    })}
  </ul>
);
