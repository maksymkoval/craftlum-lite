"use client";

import { CircleXIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDuration, formatInteger } from "@/lib/format";
import { getModel } from "@/lib/mock/models";
import { SPAN_KINDS, type Span } from "@/lib/mock/spans";
import { cn } from "@/lib/utils";

const TICK_STEPS = [250, 500, 1_000, 2_000, 5_000, 10_000, 30_000];
const MAX_TICKS = 8;
const GRID = "grid grid-cols-[minmax(0,8rem)_1fr] gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]";

const pickTickStep = (totalMs: number) =>
  TICK_STEPS.find((step) => totalMs / step <= MAX_TICKS) ?? TICK_STEPS[TICK_STEPS.length - 1] ?? 1_000;

const formatTick = (ms: number) => (ms % 1000 === 0 ? `${ms / 1000}s` : `${(ms / 1000).toFixed(1)}s`);

const SpanTooltip = ({ span }: { span: Span }) => (
  <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
    <dt className="col-span-2 mb-1 font-medium">{span.name}</dt>
    <dt className="text-muted-foreground">Type</dt>
    <dd className="text-right">{SPAN_KINDS[span.kind].label}</dd>
    <dt className="text-muted-foreground">Starts at</dt>
    <dd className="text-right tabular-nums">{formatDuration(span.start)}</dd>
    <dt className="text-muted-foreground">Duration</dt>
    <dd className="text-right tabular-nums">{formatDuration(span.duration)}</dd>
    {span.model ? (
      <>
        <dt className="text-muted-foreground">Model</dt>
        <dd className="text-right font-mono">{getModel(span.model).name}</dd>
      </>
    ) : null}
    {span.tokens ? (
      <>
        <dt className="text-muted-foreground">Tokens</dt>
        <dd className="text-right tabular-nums">{formatInteger(span.tokens)}</dd>
      </>
    ) : null}
    {span.error ? <dd className="col-span-2 mt-1 text-destructive">{span.error}</dd> : null}
  </dl>
);

type SpanBarProps = { span: Span; totalMs: number; animate: boolean };

const SpanBar = ({ span, totalMs, animate }: SpanBarProps) => {
  const left = (span.start / totalMs) * 100;
  const width = Math.max((span.duration / totalMs) * 100, 0.6);
  const end = left + width;
  // Inside the bar only when "1.50 s" fits even in the narrow timeline next to the span inspector.
  const labelInside = width > 20;
  const labelBefore = !labelInside && end > 86;
  const kind = SPAN_KINDS[span.kind];

  return (
    <span className="relative block h-7">
      <span
        className={cn(
          "absolute top-1/2 flex h-3.5 -translate-y-1/2 items-center rounded-[4px]",
          animate && "span-draw",
          span.status === "error" && "ring-2 ring-status-critical ring-offset-1 ring-offset-card",
        )}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          background: kind.colorVar,
          animationDelay: animate ? `${120 + (span.start / totalMs) * 700}ms` : undefined,
        }}
      >
        {labelInside ? (
          <span
            className={cn(
              "px-1.5 text-[11px] leading-none font-medium whitespace-nowrap text-white tabular-nums",
              width < 35 && "hidden sm:inline",
            )}
          >
            {formatDuration(span.duration)}
          </span>
        ) : null}
      </span>
      {labelInside ? null : (
        <span
          className="absolute top-1/2 hidden -translate-y-1/2 px-1.5 text-[11px] whitespace-nowrap text-muted-foreground tabular-nums sm:block"
          style={labelBefore ? { right: `${100 - left}%` } : { left: `${end}%` }}
        >
          {formatDuration(span.duration)}
        </span>
      )}
    </span>
  );
};

const SpanLabel = ({ span }: { span: Span }) => (
  <span
    className="flex h-7 min-w-0 items-center gap-2 text-left text-[13px]"
    style={{ paddingLeft: `${span.depth * 14 + 6}px` }}
  >
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-[3px]"
      style={{ background: SPAN_KINDS[span.kind].colorVar }}
    />
    <span className="truncate">{span.name}</span>
    {span.status === "error" ? (
      <CircleXIcon className="size-3.5 shrink-0 text-status-critical" aria-label="Failed" />
    ) : null}
  </span>
);

const TimeAxis = ({ totalMs }: { totalMs: number }) => {
  const step = pickTickStep(totalMs);
  const ticks = Array.from({ length: Math.floor(totalMs / step) + 1 }, (_, index) => index * step);

  return (
    <div className={GRID} aria-hidden="true">
      <span />
      <div className="relative h-5 border-b border-chart-axis">
        {ticks.map((tick, index) => (
          <span
            key={tick}
            className={cn(
              "absolute bottom-1 -translate-x-1/2 text-[11px] text-muted-foreground tabular-nums first:translate-x-0",
              index % 2 === 1 && "hidden sm:block",
              tick / totalMs > 0.94 && "hidden",
            )}
            style={{ left: `${(tick / totalMs) * 100}%` }}
          >
            {formatTick(tick)}
          </span>
        ))}
      </div>
    </div>
  );
};

export const WaterfallLegend = () => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {Object.entries(SPAN_KINDS).map(([key, kind]) => (
      <li key={key} className="flex items-center gap-1.5">
        <span className="size-2 rounded-[3px]" style={{ background: kind.colorVar }} />
        {kind.label}
      </li>
    ))}
  </ul>
);

type WaterfallProps = {
  spans: Span[];
  totalMs: number;
  label: string;
  /** Draw-in animation; use once per page, on the hero waterfall. */
  animate?: boolean;
  selectedId?: string;
  onSelect?: (span: Span) => void;
};

const rowClass =
  "grid w-full items-center rounded-md outline-none hover:bg-muted/60 focus-visible:bg-muted/60 " + GRID;

export const Waterfall = ({
  spans,
  totalMs,
  label,
  animate = false,
  selectedId,
  onSelect,
}: WaterfallProps) => (
  <div>
    <TimeAxis totalMs={totalMs} />
    <ol aria-label={label} className="mt-1.5 flex flex-col">
      {spans.map((span) => {
        const content = (
          <>
            <SpanLabel span={span} />
            <SpanBar span={span} totalMs={totalMs} animate={animate} />
          </>
        );

        if (onSelect) {
          const selected = span.id === selectedId;
          return (
            <li key={span.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(span)}
                className={cn(rowClass, "cursor-pointer", selected && "bg-accent hover:bg-accent")}
              >
                {content}
              </button>
            </li>
          );
        }

        return (
          <Tooltip key={span.id}>
            <TooltipTrigger asChild>
              <li tabIndex={0} className={rowClass}>
                {content}
              </li>
            </TooltipTrigger>
            <TooltipContent side="top" align="start">
              <SpanTooltip span={span} />
            </TooltipContent>
          </Tooltip>
        );
      })}
    </ol>
  </div>
);
