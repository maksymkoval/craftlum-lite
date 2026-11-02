import { cn } from "@/lib/utils";

/** Wordmark glyph: three offset spans, a trace waterfall in miniature. */
export const Logo = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-2", className)}>
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <rect x="2" y="3" width="16" height="3.5" rx="1.75" fill="currentColor" />
      <rect x="5" y="8.25" width="9" height="3.5" rx="1.75" fill="var(--chart-1)" />
      <rect x="9" y="13.5" width="8" height="3.5" rx="1.75" fill="var(--chart-2)" />
    </svg>
    <span className="text-[15px] font-semibold tracking-tight">Craftlum</span>
  </span>
);
