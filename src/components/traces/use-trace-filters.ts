"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MODELS, type ModelId } from "@/lib/mock/models";
import type { Trace } from "@/lib/mock/traces";
import { WORKFLOW_NAMES, type WorkflowName } from "@/lib/mock/workflows";

export const STATUS_FILTERS = ["all", "ok", "error"] as const;
export const SORT_KEYS = ["startedAt", "latencyMs", "cost", "tokens"] as const;
export const PAGE_SIZE = 25;

export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

export type TraceFilters = {
  query: string;
  status: StatusFilter;
  workflow: WorkflowName | "all";
  model: ModelId | "all";
  sort: SortKey;
  direction: SortDirection;
  page: number;
};

const DEFAULTS: TraceFilters = {
  query: "",
  status: "all",
  workflow: "all",
  model: "all",
  sort: "startedAt",
  direction: "desc",
  page: 1,
};

const oneOf = <T extends string>(options: readonly T[], value: string | null): T | undefined =>
  options.find((option) => option === value);

const MODEL_IDS = MODELS.map((model) => model.id);

const parse = (params: URLSearchParams): TraceFilters => {
  const page = Number(params.get("page"));
  return {
    query: params.get("q") ?? DEFAULTS.query,
    status: oneOf(STATUS_FILTERS, params.get("status")) ?? DEFAULTS.status,
    workflow: oneOf(WORKFLOW_NAMES, params.get("workflow")) ?? DEFAULTS.workflow,
    model: oneOf(MODEL_IDS, params.get("model")) ?? DEFAULTS.model,
    sort: oneOf(SORT_KEYS, params.get("sort")) ?? DEFAULTS.sort,
    direction: params.get("dir") === "asc" ? "asc" : DEFAULTS.direction,
    page: Number.isInteger(page) && page > 0 ? page : DEFAULTS.page,
  };
};

const serialize = (filters: TraceFilters) => {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status !== DEFAULTS.status) params.set("status", filters.status);
  if (filters.workflow !== DEFAULTS.workflow) params.set("workflow", filters.workflow);
  if (filters.model !== DEFAULTS.model) params.set("model", filters.model);
  if (filters.sort !== DEFAULTS.sort) params.set("sort", filters.sort);
  if (filters.direction !== DEFAULTS.direction) params.set("dir", filters.direction);
  if (filters.page !== DEFAULTS.page) params.set("page", String(filters.page));
  return params.toString();
};

const sortValue = (trace: Trace, key: SortKey) =>
  key === "tokens" ? trace.tokensIn + trace.tokensOut : trace[key];

export const applyFilters = (traces: Trace[], filters: TraceFilters) => {
  const needle = filters.query.trim().toLowerCase();
  const matches = traces.filter(
    (trace) =>
      (filters.status === "all" || trace.status === filters.status) &&
      (filters.workflow === "all" || trace.workflow === filters.workflow) &&
      (filters.model === "all" || trace.model === filters.model) &&
      (!needle ||
        trace.id.includes(needle) ||
        trace.input.toLowerCase().includes(needle) ||
        trace.user.includes(needle)),
  );
  const sign = filters.direction === "asc" ? 1 : -1;
  return matches.toSorted((a, b) => (sortValue(a, filters.sort) - sortValue(b, filters.sort)) * sign);
};

/** Filter state lives in the URL, so a filtered view can be shared or bookmarked. */
export const useTraceFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => parse(new URLSearchParams(searchParams.toString())), [searchParams]);

  const update = useCallback(
    (patch: Partial<TraceFilters>) => {
      // Any change other than paging returns to the first page.
      const next = { ...filters, page: 1, ...patch };
      const query = serialize(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const isFiltered =
    filters.query !== DEFAULTS.query ||
    filters.status !== DEFAULTS.status ||
    filters.workflow !== DEFAULTS.workflow ||
    filters.model !== DEFAULTS.model;

  return { filters, update, reset, isFiltered };
};
