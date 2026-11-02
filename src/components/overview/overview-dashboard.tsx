"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Briefing } from "@/components/ui/briefing";
import { PageHeader } from "@/components/ui/page-header";
import { buildOverviewInsights } from "@/lib/insights/overview";
import { buildOverview, RANGES, type RangeDays } from "@/lib/mock/metrics";
import { getTraces } from "@/lib/mock/traces";
import { KpiStrip } from "./kpi-strip";
import { LatencyChart } from "./latency-chart";
import { ModelBreakdown } from "./model-breakdown";
import { RecentTraces } from "./recent-traces";
import { RunWaterfall } from "./run-waterfall";
import { SpendChart } from "./spend-chart";
import { TopErrors } from "./top-errors";

const TRACES = getTraces();
const RECENT_TRACES = TRACES.slice(0, 10);
/** Hero: the most recent completed support-agent run. */
const LATEST_RUN =
  TRACES.find((trace) => trace.workflow === "support-agent" && trace.status === "ok") ?? TRACES[0];

const isRange = (value: number): value is RangeDays => RANGES.some((range) => range.days === value);

const RangePicker = ({ value, onChange }: { value: RangeDays; onChange: (days: RangeDays) => void }) => {
  const current = RANGES.find((range) => range.days === value) ?? RANGES[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon />
          {current.label}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={String(value)}
          onValueChange={(next) => {
            const days = Number(next);
            if (isRange(days)) onChange(days);
          }}
        >
          {RANGES.map((range) => (
            <DropdownMenuRadioItem key={range.days} value={String(range.days)}>
              {range.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const OverviewDashboard = () => {
  const [range, setRange] = useState<RangeDays>(14);
  const { current, previous } = useMemo(() => buildOverview(range), [range]);
  const briefing = useMemo(() => buildOverviewInsights(current, previous), [current, previous]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Overview"
        description="How your agents behaved, what they cost, and where they failed."
        actions={<RangePicker value={range} onChange={setRange} />}
      />

      <Briefing insights={briefing.insights} />

      <KpiStrip current={current} previous={previous} days={range} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LatencyChart data={current.daily} annotations={briefing.latency} />
        </div>
        <TopErrors traces={TRACES} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SpendChart data={current.daily} annotations={briefing.spend} />
        </div>
        <ModelBreakdown data={current.daily} />
      </div>

      {LATEST_RUN ? <RunWaterfall trace={LATEST_RUN} /> : null}

      <RecentTraces traces={RECENT_TRACES} />
    </div>
  );
};
