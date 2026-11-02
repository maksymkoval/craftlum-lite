"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatClock,
  formatCompact,
  formatDuration,
  formatInteger,
  formatPercent,
  formatUsd,
  formatUsdPrecise,
} from "@/lib/format";
import { getModel, MODELS } from "@/lib/mock/models";
import { getTraces, type Trace } from "@/lib/mock/traces";
import { WORKFLOW_NAMES } from "@/lib/mock/workflows";
import { cn } from "@/lib/utils";
import { FilterMenu } from "./filter-menu";
import { LatencyHistogram, percentile } from "./latency-histogram";
import { TraceStatusLabel } from "./trace-status";
import {
  applyFilters,
  PAGE_SIZE,
  useTraceFilters,
  type SortKey,
  type StatusFilter,
  type TraceFilters,
} from "./use-trace-filters";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ok", label: "OK" },
  { value: "error", label: "Errors" },
] as const satisfies readonly { value: StatusFilter; label: string }[];

const WORKFLOW_OPTIONS = WORKFLOW_NAMES.map((name) => ({ value: name, label: name }));
const MODEL_OPTIONS = MODELS.map((model) => ({ value: model.id, label: model.name }));

const SearchBox = ({ value, onCommit }: { value: string; onCommit: (query: string) => void }) => {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  // Follow outside changes (Clear, back button) without an effect.
  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onCommit(draft), 250);
    return () => clearTimeout(timer);
  }, [draft, value, onCommit]);

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search input, trace ID or user"
        aria-label="Search traces"
        className="pl-8"
      />
    </div>
  );
};

const Summary = ({ traces }: { traces: Trace[] }) => {
  const errors = traces.filter((trace) => trace.status === "error").length;
  const cost = traces.reduce((sum, trace) => sum + trace.cost, 0);
  const p95 = percentile(
    traces.map((trace) => trace.latencyMs),
    0.95,
  );

  const empty = traces.length === 0;
  const facts = [
    { label: "Traces", value: formatInteger(traces.length) },
    { label: "Error rate", value: empty ? "—" : formatPercent(errors / traces.length, 1) },
    { label: "p95 latency", value: empty ? "—" : formatDuration(p95) },
    { label: "Cost", value: empty ? "—" : formatUsd(cost) },
  ];

  return (
    <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-label">{fact.label}</dt>
          <dd className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
};

type SortableHeadProps = {
  label: string;
  sortKey: SortKey;
  filters: TraceFilters;
  onSort: (key: SortKey) => void;
  className?: string;
};

const SortableHead = ({ label, sortKey, filters, onSort, className }: SortableHeadProps) => {
  const active = filters.sort === sortKey;
  const Icon = filters.direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <TableHead
      className={cn("text-right", className)}
      aria-sort={active ? (filters.direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("size-3", !active && "invisible")} aria-hidden="true" />
      </button>
    </TableHead>
  );
};

const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
    <SearchXIcon className="size-6 text-muted-foreground" aria-hidden="true" />
    <div>
      <p className="font-medium">No traces match these filters</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Widen the search or clear filters to see all traces.
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onReset}>
      Clear filters
    </Button>
  </div>
);

type PaginationProps = { page: number; total: number; onPage: (page: number) => void };

const Pagination = ({ page, total, onPage }: PaginationProps) => {
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
      <p className="text-[13px] text-muted-foreground tabular-nums">
        {formatInteger(from)}–{formatInteger(to)} of {formatInteger(total)}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <span className="px-2 text-[13px] tabular-nums">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
};

const TraceRow = ({ trace }: { trace: Trace }) => {
  const router = useRouter();
  const model = getModel(trace.model);
  const href = `/traces/${trace.id}`;

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(href)}>
      <TableCell className="pl-4">
        <TraceStatusLabel status={trace.status} />
      </TableCell>
      <TableCell className="max-w-[22rem]">
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="block truncate font-medium underline-offset-4 hover:underline"
        >
          {trace.input}
        </Link>
        <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
          {trace.id} · {trace.user}
        </span>
      </TableCell>
      <TableCell className="text-[13px]">{trace.workflow}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 font-mono text-xs">
          <span className="size-2 rounded-[3px]" style={{ background: model.colorVar }} />
          {model.name}
        </span>
      </TableCell>
      <TableCell className="text-right tabular-nums">{trace.spans.length}</TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCompact(trace.tokensIn + trace.tokensOut)}
      </TableCell>
      <TableCell className="text-right tabular-nums">{formatDuration(trace.latencyMs)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatUsdPrecise(trace.cost)}</TableCell>
      <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
        {formatClock(trace.startedAt)}
      </TableCell>
    </TableRow>
  );
};

export const TracesExplorer = () => {
  const traces = getTraces();
  const { filters, update, reset, isFiltered } = useTraceFilters();
  const matches = useMemo(() => applyFilters(traces, filters), [traces, filters]);
  const pages = Math.max(Math.ceil(matches.length / PAGE_SIZE), 1);
  const page = Math.min(filters.page, pages);
  const visible = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onSort = (key: SortKey) =>
    update({
      sort: key,
      direction: filters.sort === key && filters.direction === "desc" ? "asc" : "desc",
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBox value={filters.query} onCommit={(query) => update({ query })} />
          <Segmented
            label="Status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onValueChange={(status) => update({ status })}
          />
          <FilterMenu
            label="Workflow"
            value={filters.workflow}
            options={WORKFLOW_OPTIONS}
            onChange={(workflow) => update({ workflow })}
          />
          <FilterMenu
            label="Model"
            value={filters.model}
            options={MODEL_OPTIONS}
            onChange={(model) => update({ model })}
          />
          {isFiltered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <Panel className="flex flex-col gap-6 p-4 lg:flex-row lg:items-end">
        <Summary traces={matches} />
        <LatencyHistogram traces={matches} />
      </Panel>

      <Panel className="overflow-hidden">
        {matches.length === 0 ? (
          <EmptyState onReset={reset} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Status</TableHead>
                  <TableHead>Input</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Spans</TableHead>
                  <SortableHead label="Tokens" sortKey="tokens" filters={filters} onSort={onSort} />
                  <SortableHead label="Latency" sortKey="latencyMs" filters={filters} onSort={onSort} />
                  <SortableHead label="Cost" sortKey="cost" filters={filters} onSort={onSort} />
                  <SortableHead
                    label="Started"
                    sortKey="startedAt"
                    filters={filters}
                    onSort={onSort}
                    className="pr-4"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((trace) => (
                  <TraceRow key={trace.id} trace={trace} />
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} total={matches.length} onPage={(next) => update({ page: next })} />
          </>
        )}
      </Panel>
    </div>
  );
};
