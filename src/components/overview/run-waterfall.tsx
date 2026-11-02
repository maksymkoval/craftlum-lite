import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { TraceStatusLabel } from "@/components/traces/trace-status";
import { Waterfall, WaterfallLegend } from "@/components/traces/waterfall";
import { formatDuration, formatInteger, formatUsdPrecise } from "@/lib/format";
import type { Trace } from "@/lib/mock/traces";

const RunFact = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-[15px] font-medium tabular-nums">{value}</dd>
  </div>
);

export const RunWaterfall = ({ trace }: { trace: Trace }) => (
  <Panel className="overflow-hidden">
    <div className="flex flex-col gap-4 border-b px-4 py-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{trace.workflow}</span>
          <span className="font-mono text-xs">{trace.id}</span>
          <TraceStatusLabel status={trace.status} />
        </div>
        <p className="mt-2 max-w-[60ch] text-xl font-medium tracking-tight text-balance md:text-2xl">
          “{trace.input}”
        </p>
      </div>
      <div className="flex items-end gap-6">
        <dl className="flex gap-6">
          <RunFact label="Duration" value={formatDuration(trace.latencyMs)} />
          <RunFact label="Tokens" value={formatInteger(trace.tokensIn + trace.tokensOut)} />
          <RunFact label="Cost" value={formatUsdPrecise(trace.cost)} />
        </dl>
        <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
          <Link href={`/traces/${trace.id}`}>
            Open trace
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>
    </div>

    <div className="px-4 pt-3 pb-4">
      <Waterfall spans={trace.spans} totalMs={trace.latencyMs} label={`Spans in trace ${trace.id}`} animate />
      <div className="mt-3 flex items-center justify-between gap-4">
        <WaterfallLegend />
        <p className="hidden text-xs text-muted-foreground md:block">Hover a span for details</p>
      </div>
    </div>
  </Panel>
);
