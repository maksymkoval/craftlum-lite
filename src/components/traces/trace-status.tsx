import { CircleCheckIcon, CircleXIcon } from "lucide-react";

import type { TraceStatus } from "@/lib/mock/traces";
import { cn } from "@/lib/utils";

/** Status is always icon + word, never color alone. */
export const TraceStatusLabel = ({ status, className }: { status: TraceStatus; className?: string }) =>
  status === "ok" ? (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-status-good-text", className)}>
      <CircleCheckIcon className="size-3.5" aria-hidden="true" /> OK
    </span>
  ) : (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-destructive", className)}>
      <CircleXIcon className="size-3.5" aria-hidden="true" /> Error
    </span>
  );
