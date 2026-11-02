"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDuration, formatInteger } from "@/lib/format";
import type { Trace } from "@/lib/mock/traces";

const BIN_COUNT = 28;

export const percentile = (values: number[], ratio: number) => {
  if (values.length === 0) return 0;
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
};

type Bin = { from: number; to: number; ok: number; error: number };

const binTraces = (traces: Trace[], max: number): Bin[] => {
  const width = max / BIN_COUNT;
  const bins: Bin[] = Array.from({ length: BIN_COUNT }, (_, index) => ({
    from: index * width,
    to: (index + 1) * width,
    ok: 0,
    error: 0,
  }));
  for (const trace of traces) {
    const bin = bins[Math.min(Math.floor(trace.latencyMs / width), BIN_COUNT - 1)];
    if (!bin) continue;
    if (trace.status === "error") bin.error += 1;
    else bin.ok += 1;
  }
  return bins;
};

const Marker = ({ value, max, label }: { value: number; max: number; label: string }) => (
  <div
    className="pointer-events-none absolute inset-y-0 border-l border-dashed border-foreground/50"
    style={{ left: `${(value / max) * 100}%` }}
  >
    <span className="absolute -top-0.5 left-1 text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
      {label} {formatDuration(value)}
    </span>
  </div>
);

/**
 * Latency distribution of the traces currently in view. Failed runs stack on
 * top in the error color, so slow and failing usually read as one story.
 */
export const LatencyHistogram = ({ traces }: { traces: Trace[] }) => {
  const latencies = traces.map((trace) => trace.latencyMs);
  const max = Math.max(...latencies, 1_000);
  const bins = binTraces(traces, max);
  const tallest = Math.max(...bins.map((bin) => bin.ok + bin.error), 1);
  const p50 = percentile(latencies, 0.5);
  const p95 = percentile(latencies, 0.95);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div
        className="relative h-24 pt-4"
        role="img"
        aria-label={`Latency distribution, p50 ${formatDuration(p50)}, p95 ${formatDuration(p95)}`}
      >
        <div className="flex h-full items-end gap-[2px] border-b border-chart-axis">
          {bins.map((bin) => {
            const total = bin.ok + bin.error;
            return (
              <Tooltip key={bin.from}>
                <TooltipTrigger asChild>
                  <div className="flex h-full flex-1 flex-col justify-end hover:opacity-80">
                    {bin.error > 0 ? (
                      <div
                        className="rounded-t-[2px] bg-status-critical"
                        style={{ height: `${(bin.error / tallest) * 100}%` }}
                      />
                    ) : null}
                    {bin.ok > 0 ? (
                      <div
                        className={bin.error > 0 ? "bg-chart-1" : "rounded-t-[2px] bg-chart-1"}
                        style={{ height: `${(bin.ok / tallest) * 100}%` }}
                      />
                    ) : null}
                    {total === 0 ? <div className="h-px" /> : null}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium tabular-nums">
                    {formatDuration(bin.from)} – {formatDuration(bin.to)}
                  </p>
                  <p className="text-muted-foreground tabular-nums">
                    {formatInteger(bin.ok)} OK · {formatInteger(bin.error)} failed
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {traces.length > 0 ? (
          <>
            <Marker value={p50} max={max} label="p50" />
            <Marker value={p95} max={max} label="p95" />
          </>
        ) : null}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>0 s</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-chart-1" /> OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-status-critical" /> Failed
          </span>
        </span>
        <span>{formatDuration(max)}</span>
      </div>
    </div>
  );
};
