import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { Sparkline } from "@/components/ui/sparkline";
import { formatCompact, formatDuration, formatPercent, formatUsd, relativeChange } from "@/lib/format";
import type { DailyPoint, PeriodSummary } from "@/lib/mock/metrics";
import { MODELS } from "@/lib/mock/models";
import { cn } from "@/lib/utils";

type Direction = "higher-is-better" | "lower-is-better";

type Metric = {
  label: string;
  value: string;
  change: number;
  direction: Direction;
  series: number[];
  context?: string;
};

const Change = ({ change, direction }: { change: number; direction: Direction }) => {
  const improved = direction === "higher-is-better" ? change >= 0 : change <= 0;
  const Icon = change >= 0 ? ArrowUpRightIcon : ArrowDownRightIcon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        improved ? "text-status-good-text" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {formatPercent(Math.abs(change), 1)}
      <span className="sr-only">{improved ? "improvement" : "regression"} vs previous period</span>
    </span>
  );
};

const dailyCost = (point: DailyPoint) => MODELS.reduce((sum, model) => sum + point[model.id], 0);

const toMetrics = (current: PeriodSummary, previous: Omit<PeriodSummary, "daily">): Metric[] => [
  {
    label: "Requests",
    value: formatCompact(current.requests),
    change: relativeChange(current.requests, previous.requests),
    direction: "higher-is-better",
    series: current.daily.map((point) => point.requests),
    context: `${formatCompact(current.requests / Math.max(current.daily.length, 1))} per day on average`,
  },
  {
    label: "Error rate",
    value: formatPercent(current.errorRate),
    change: relativeChange(current.errorRate, previous.errorRate),
    direction: "lower-is-better",
    series: current.daily.map((point) => point.errors / point.requests),
    context: `${formatCompact(current.daily.reduce((sum, point) => sum + point.errors, 0))} failed requests`,
  },
  {
    label: "p95 latency",
    value: formatDuration(current.p95),
    change: relativeChange(current.p95, previous.p95),
    direction: "lower-is-better",
    series: current.daily.map((point) => point.p95),
    context: `${current.daily.filter((point) => point.p95 > 6_000).length} of ${current.daily.length} days over the 6 s SLO`,
  },
  {
    label: "Spend",
    value: formatUsd(current.cost),
    change: relativeChange(current.cost, previous.cost),
    direction: "lower-is-better",
    series: current.daily.map(dailyCost),
    context: `${formatUsd(current.cost / Math.max(current.daily.length, 1))} per day on average`,
  },
];

type KpiStripProps = {
  current: PeriodSummary;
  previous: Omit<PeriodSummary, "daily">;
  days: number;
};

export const KpiStrip = ({ current, previous, days }: KpiStripProps) => (
  <Panel>
    <dl className="grid grid-cols-2 lg:grid-cols-4">
      {toMetrics(current, previous).map((metric, index) => (
        <div
          key={metric.label}
          className={cn(
            "flex flex-col gap-2.5 p-4",
            index % 2 === 1 && "border-l",
            index >= 2 && "border-t lg:border-t-0",
            index === 2 && "lg:border-l",
          )}
        >
          <dt className="text-label">{metric.label}</dt>
          <dd className="flex flex-col gap-2.5">
            <span className="flex flex-col gap-1">
              <span className="text-figure">{metric.value}</span>
              <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                <Change change={metric.change} direction={metric.direction} />
                vs previous {days} days
              </span>
            </span>
            <Sparkline values={metric.series} />
            {metric.context ? <span className="text-xs text-muted-foreground">{metric.context}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  </Panel>
);
