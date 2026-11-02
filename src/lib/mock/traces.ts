import { createRandom, DEMO_NOW } from "./random";
import { tokenCost, type ModelId } from "./models";
import type { Span } from "./spans";
import {
  ERROR_MESSAGES,
  WORKFLOW_NAMES,
  WORKFLOWS,
  type ErrorKind,
  type StepTemplate,
  type WorkflowName,
} from "./workflows";

export type TraceStatus = "ok" | "error";

export type Trace = {
  id: string;
  workflow: WorkflowName;
  input: string;
  status: TraceStatus;
  model: ModelId;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  cost: number;
  spans: Span[];
  startedAt: number;
  user: string;
  error?: string;
};

const MODEL_IDS = ["claude-sonnet", "gpt-large", "gemini-flash", "llama-70b"] as const;
const ERROR_KINDS = ["tool-timeout", "schema", "rate-limit", "context"] as const;
const USERS = ["usr_8f2k", "usr_1qp9", "usr_77xa", "usr_c03m", "usr_k4n1", "usr_z9e2"] as const;

type Random = ReturnType<typeof createRandom>;

const traceId = (random: Random) =>
  `tr_${Math.floor(random.next() * 0xffffffff)
    .toString(16)
    .padStart(8, "0")}`;

const seedFrom = (id: string) =>
  [...id].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261);

const errorMessage = (kind: ErrorKind, step: StepTemplate) =>
  kind === "tool-timeout" ? `Tool \`${step.name}\` timed out after 10s` : ERROR_MESSAGES[kind];

/** Error kinds a workflow can actually produce, so failures land on a real step. */
const possibleErrors = (workflow: WorkflowName) =>
  ERROR_KINDS.filter((kind) => WORKFLOWS[workflow].steps.some((step) => step.failsWith?.includes(kind)));

type SpanPlan = { step: StepTemplate; start: number; duration: number };

const layOutSteps = (steps: StepTemplate[], latencyMs: number, random: Random): SpanPlan[] => {
  let cursor = 30;
  let previousStart = 30;
  const plans = steps.map((step) => {
    const duration = step.weight * latencyMs * random.between(0.85, 1.15);
    const start = step.parallel ? previousStart + random.between(10, 40) : cursor;
    previousStart = start;
    cursor = Math.max(cursor, start + duration) + random.between(10, 40);
    return { step, start, duration };
  });

  const scale = (latencyMs - 40) / Math.max(cursor, 1);
  return plans.map((plan) => ({
    step: plan.step,
    start: Math.round(plan.start * scale),
    duration: Math.max(Math.round(plan.duration * scale), 12),
  }));
};

type SpanInput = {
  id: string;
  workflow: WorkflowName;
  query: string;
  model: ModelId;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  errorKind?: ErrorKind;
};

const buildSpans = (trace: SpanInput): { spans: Span[]; error?: string } => {
  const random = createRandom(seedFrom(trace.id));
  const template = WORKFLOWS[trace.workflow];
  const { errorKind } = trace;
  const failingIndex = errorKind
    ? template.steps.findIndex((step) => step.failsWith?.includes(errorKind))
    : -1;
  const steps = failingIndex >= 0 ? template.steps.slice(0, failingIndex + 1) : template.steps;
  const plans = layOutSteps(steps, trace.latencyMs, random);

  const llmWeight = steps.filter((step) => step.kind === "llm").reduce((sum, step) => sum + step.weight, 0);
  const totalTokens = trace.tokensIn + trace.tokensOut;

  let error: string | undefined;
  const children: Span[] = plans.map(({ step, start, duration }, index) => {
    const message = index === failingIndex && errorKind ? errorMessage(errorKind, step) : undefined;
    const failed = message !== undefined;
    if (message) error = message;

    return {
      id: `${trace.id}-s${index + 1}`,
      name: step.name,
      kind: step.kind,
      start,
      duration,
      depth: step.depth ?? 1,
      model: step.kind === "llm" ? trace.model : undefined,
      tokens:
        step.kind === "llm" ? Math.round((step.weight / Math.max(llmWeight, 0.01)) * totalTokens) : undefined,
      status: failed ? "error" : "ok",
      input: step.input(trace.query),
      output: failed ? undefined : step.output(trace.query),
      error: message,
    } satisfies Span;
  });

  const root: Span = {
    id: `${trace.id}-s0`,
    name: trace.workflow,
    kind: "agent",
    start: 0,
    duration: trace.latencyMs,
    depth: 0,
    status: error ? "error" : "ok",
    input: trace.query,
    output: error ? undefined : children.at(-1)?.output,
    error,
  };

  return { spans: [root, ...children], error };
};

export const buildTraces = (count = 40): Trace[] => {
  const random = createRandom(28);
  let cursor = DEMO_NOW;

  return Array.from({ length: count }, () => {
    cursor -= random.int(20, 240) * 1000;
    const model = random.pick(MODEL_IDS);
    const tokensIn = random.int(900, 24_000);
    const tokensOut = random.int(120, 2_400);
    const failed = random.next() < 0.12;
    const id = traceId(random);
    const workflow = random.pick(WORKFLOW_NAMES);
    const latencyMs = Math.round(random.between(600, 9_000) * (failed ? 1.6 : 1));
    random.int(3, 28); // reserved draw keeps the demo sequence stable
    const user = random.pick(USERS);
    if (failed) random.next();

    // Per-trace details come from the trace id, so they never shift the list.
    const detail = createRandom(seedFrom(id) ^ 0x9e3779b9);
    const query = detail.pick(WORKFLOWS[workflow].inputs);
    const errorOptions = possibleErrors(workflow);
    const errorKind =
      failed && errorOptions.length > 0
        ? errorOptions[Math.floor(detail.next() * errorOptions.length)]
        : undefined;

    const { spans, error } = buildSpans({
      id,
      workflow,
      query,
      model,
      latencyMs,
      tokensIn,
      tokensOut,
      errorKind,
    });

    return {
      id,
      workflow,
      input: query,
      status: error ? "error" : "ok",
      model,
      tokensIn,
      tokensOut,
      latencyMs,
      cost: tokenCost(model, tokensIn, tokensOut),
      spans,
      startedAt: cursor,
      user,
      error,
    } satisfies Trace;
  });
};

let cache: Trace[] | undefined;

/** The shared demo dataset (400 traces), built once per process. */
export const getTraces = () => {
  cache ??= buildTraces(400);
  return cache;
};

export const getTrace = (id: string) => getTraces().find((trace) => trace.id === id);
