"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { ChartPin } from "@/components/ui/pin";
import type { ChartAnnotation } from "@/lib/insights/overview";
import { formatDay, formatDuration } from "@/lib/format";
import type { DailyPoint } from "@/lib/mock/metrics";
import { ChartTooltipCard } from "./chart-tooltip";

const AXIS_TICK = { fill: "var(--chart-ink-muted)", fontSize: 11 };
const SLO_MS = 6_000;

const SERIES = [
  { key: "p95", label: "p95", colorVar: "var(--chart-1)" },
  { key: "p50", label: "p50", colorVar: "var(--chart-2)" },
] as const;

type TooltipPayload = { payload?: DailyPoint }[];

const LatencyTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload }) => {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const rows = SERIES.map((series) => ({
    key: series.key,
    label: series.label,
    colorVar: series.colorVar,
    value: formatDuration(point[series.key]),
  }));

  return <ChartTooltipCard date={point.date} rows={rows} />;
};

type LatencyChartProps = { data: DailyPoint[]; annotations?: ChartAnnotation[] };

export const LatencyChart = ({ data, annotations = [] }: LatencyChartProps) => (
  <Panel className="flex flex-col">
    <PanelHeader
      title="Latency"
      description={`End-to-end trace duration · SLO ${formatDuration(SLO_MS)} at p95`}
      action={
        <ul className="flex gap-3 text-xs text-muted-foreground">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ background: series.colorVar }} />
              {series.label}
            </li>
          ))}
        </ul>
      }
    />
    <div className="h-64 px-2 pb-3" role="img" aria-label="Line chart of p50 and p95 latency by day">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(value: number) => `${value / 1000}s`}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={[0, 8_000]}
            ticks={[0, 2_000, 4_000, 6_000, 8_000]}
          />
          <ReferenceArea y1={SLO_MS} y2={8_000} fill="var(--status-critical)" fillOpacity={0.06} />
          {annotations.map((note) => (
            <ReferenceLine
              key={`line-${note.pin}`}
              x={note.date}
              stroke="var(--pin)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
          <ReferenceLine
            y={SLO_MS}
            stroke="var(--chart-ink-muted)"
            strokeDasharray="4 4"
            label={{ value: "SLO", position: "insideTopRight", fill: "var(--chart-ink-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)" }}
            content={<LatencyTooltip />}
            isAnimationActive={false}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              dataKey={series.key}
              stroke={series.colorVar}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
          {annotations.map((note) => (
            <ReferenceDot
              key={`pin-${note.pin}`}
              x={note.date}
              y={7_600}
              shape={(props: { cx?: number; cy?: number }) => (
                <ChartPin cx={props.cx} cy={props.cy} n={note.pin} />
              )}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);
