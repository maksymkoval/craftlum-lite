import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { TraceStatusLabel } from "@/components/traces/trace-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatClock, formatCompact, formatDuration, formatUsdPrecise } from "@/lib/format";
import { getModel } from "@/lib/mock/models";
import type { Trace } from "@/lib/mock/traces";

const LatencyCell = ({ value, max }: { value: number; max: number }) => (
  <span className="flex items-center justify-end gap-2">
    <span className="tabular-nums">{formatDuration(value)}</span>
    <span className="hidden h-1 w-14 overflow-hidden rounded-full bg-muted md:block" aria-hidden="true">
      <span
        className="block h-full rounded-full bg-foreground/60"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </span>
  </span>
);

export const RecentTraces = ({ traces }: { traces: Trace[] }) => {
  const maxLatency = Math.max(...traces.map((trace) => trace.latencyMs));

  return (
    <Panel>
      <PanelHeader
        title="Recent traces"
        description="Latest runs across all workflows"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/traces">View all traces</Link>
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Status</TableHead>
            <TableHead>Trace</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Latency</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="pr-4 text-right">Started</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map((trace) => {
            const model = getModel(trace.model);
            return (
              <TableRow key={trace.id}>
                <TableCell className="pl-4">
                  <TraceStatusLabel status={trace.status} />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <Link
                    href={`/traces/${trace.id}`}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {trace.id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{trace.workflow}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 font-mono text-xs">
                    <span className="size-2 rounded-[3px]" style={{ background: model.colorVar }} />
                    {model.name}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCompact(trace.tokensIn + trace.tokensOut)}
                </TableCell>
                <TableCell className="text-right">
                  <LatencyCell value={trace.latencyMs} max={maxLatency} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatUsdPrecise(trace.cost)}</TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                  {formatClock(trace.startedAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Panel>
  );
};
