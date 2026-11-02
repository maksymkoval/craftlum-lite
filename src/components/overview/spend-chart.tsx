"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { formatDay, formatUsd } from "@/lib/format";
import type { DailyPoint } from "@/lib/mock/metrics";
import { MODELS } from "@/lib/mock/models";
import { ChartTooltipCard } from "./chart-tooltip";

const AXIS_TICK = { fill: "var(--chart-ink-muted)", fontSize: 11 };
const TOP_SEGMENT_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

type TooltipPayload = { payload?: DailyPoint }[];

const SpendTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload }) => {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const total = MODELS.reduce((sum, model) => sum + point[model.id], 0);
  const rows = [...MODELS].reverse().map((model) => ({
    key: model.id,
    label: model.name,
    colorVar: model.colorVar,
    value: formatUsd(point[model.id]),
  }));

  return <ChartTooltipCard date={point.date} rows={rows} total={formatUsd(total)} />;
};

const Legend = () => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 text-xs text-muted-foreground">
    {MODELS.map((model) => (
      <li key={model.id} className="flex items-center gap-1.5">
        <span className="size-2 rounded-[3px]" style={{ background: model.colorVar }} />
        {model.name}
      </li>
    ))}
  </ul>
);

type SpendChartProps = { data: DailyPoint[]; annotations?: ChartAnnotation[] };

export const SpendChart = ({ data, annotations = [] }: SpendChartProps) => {
  const peak = Math.max(...data.map((point) => MODELS.reduce((sum, model) => sum + point[model.id], 0)));

  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Spend by model" description="Daily provider cost, stacked by model" />
      <div className="h-64 px-2" role="img" aria-label="Stacked bar chart of daily spend by model">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
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
              tickFormatter={(value: number) => `$${value}`}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={<SpendTooltip />}
              isAnimationActive={false}
            />
            {annotations.map((note) => (
              <ReferenceLine
                key={`line-${note.pin}`}
                x={note.date}
                stroke="var(--pin)"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            ))}
            {MODELS.map((model, index) => (
              <Bar
                key={model.id}
                dataKey={model.id}
                name={model.name}
                stackId="spend"
                fill={model.colorVar}
                stroke="var(--card)"
                strokeWidth={1}
                radius={index === MODELS.length - 1 ? TOP_SEGMENT_RADIUS : 0}
                isAnimationActive={false}
              />
            ))}
            {annotations.map((note) => (
              <ReferenceDot
                key={`pin-${note.pin}`}
                x={note.date}
                y={peak * 1.08}
                shape={(props: { cx?: number; cy?: number }) => (
                  <ChartPin cx={props.cx} cy={props.cy} n={note.pin} />
                )}
                ifOverflow="extendDomain"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend />
    </Panel>
  );
};
