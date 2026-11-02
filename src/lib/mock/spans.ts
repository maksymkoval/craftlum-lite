import type { ModelId } from "./models";

export type SpanKind = "agent" | "llm" | "tool" | "retrieval";

export type Span = {
  id: string;
  name: string;
  kind: SpanKind;
  /** ms from run start */
  start: number;
  duration: number;
  depth: number;
  model?: ModelId;
  tokens?: number;
  status: "ok" | "error";
  /** Prompt, tool arguments or query, as shown in the span inspector. */
  input?: string;
  output?: string;
  error?: string;
};

export const SPAN_KINDS: Record<SpanKind, { label: string; colorVar: string }> = {
  agent: { label: "Agent", colorVar: "var(--chart-5)" },
  llm: { label: "LLM call", colorVar: "var(--chart-1)" },
  tool: { label: "Tool", colorVar: "var(--chart-2)" },
  retrieval: { label: "Retrieval", colorVar: "var(--chart-3)" },
};
