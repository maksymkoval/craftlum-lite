"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, CircleXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { formatClock, formatDuration, formatInteger, formatUsdPrecise } from "@/lib/format";
import { getModel } from "@/lib/mock/models";
import type { Span } from "@/lib/mock/spans";
import { getTrace, type Trace } from "@/lib/mock/traces";
import { SpanInspector } from "./span-inspector";
import { TraceStatusLabel } from "./trace-status";
import { Waterfall, WaterfallLegend } from "./waterfall";

const Fact = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={mono ? "truncate font-mono text-[13px]" : "text-[15px] font-medium tabular-nums"}>
      {value}
    </dd>
  </div>
);

const defaultSpan = (trace: Trace): Span | undefined =>
  trace.spans.find((span) => span.status === "error" && span.kind !== "agent") ?? trace.spans[0];

const TraceView = ({ trace }: { trace: Trace }) => {
  const [selected, setSelected] = useState<Span | undefined>(() => defaultSpan(trace));
  const inspectorRef = useRef<HTMLDivElement>(null);

  const select = (span: Span) => {
    setSelected(span);
    // Below xl the inspector sits under the timeline; bring it into view.
    if (window.matchMedia("(max-width: 1279px)").matches) {
      inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const failedSpan = trace.spans.find((span) => span.status === "error" && span.kind !== "agent");
  const model = getModel(trace.model);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2.5" asChild>
          <Link href="/traces">
            <ChevronLeftIcon />
            Traces
          </Link>
        </Button>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{trace.workflow}</span>
          <span className="font-mono text-xs">{trace.id}</span>
          <TraceStatusLabel status={trace.status} />
        </div>
        <h1 className="text-page-title mt-2 max-w-[60ch]">“{trace.input}”</h1>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Fact label="Duration" value={formatDuration(trace.latencyMs)} />
        <Fact label="Spans" value={formatInteger(trace.spans.length)} />
        <Fact
          label="Tokens in / out"
          value={`${formatInteger(trace.tokensIn)} / ${formatInteger(trace.tokensOut)}`}
        />
        <Fact label="Cost" value={formatUsdPrecise(trace.cost)} />
        <Fact label="Model" value={model.name} mono />
        <Fact label="Started" value={formatClock(trace.startedAt)} />
      </dl>

      {failedSpan ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center"
        >
          <CircleXIcon className="size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Run stopped at {failedSpan.name}</p>
            <p className="mt-0.5 text-muted-foreground">{failedSpan.error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => select(failedSpan)}>
            Show failed span
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel className="overflow-hidden">
          <PanelHeader title="Timeline" description="Select a span to inspect its input and output" />
          <div className="px-4 pb-4">
            <Waterfall
              spans={trace.spans}
              totalMs={trace.latencyMs}
              label={`Spans in trace ${trace.id}`}
              selectedId={selected?.id}
              onSelect={select}
            />
            <div className="mt-3">
              <WaterfallLegend />
            </div>
          </div>
        </Panel>
        <div ref={inspectorRef} className="scroll-mt-20 xl:sticky xl:top-20">
          {selected ? <SpanInspector span={selected} /> : null}
        </div>
      </div>
    </div>
  );
};

export const TraceDetail = ({ traceId }: { traceId: string }) => {
  const trace = getTrace(traceId);
  if (!trace) return null;
  // Remount per trace so the selected span resets when navigating between traces.
  return <TraceView key={trace.id} trace={trace} />;
};
