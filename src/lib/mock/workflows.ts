import type { SpanKind } from "./spans";

export type WorkflowName =
  "support-agent" | "invoice-extractor" | "docs-search" | "lead-enrichment" | "code-review-bot";

export type ErrorKind = "tool-timeout" | "schema" | "rate-limit" | "context";

/**
 * One step of a workflow. `weight` is its share of the run's duration;
 * `parallel` starts it alongside the previous step instead of after it.
 */
export type StepTemplate = {
  name: string;
  kind: Exclude<SpanKind, "agent">;
  weight: number;
  depth?: 1 | 2;
  parallel?: boolean;
  input: (query: string) => string;
  output: (query: string) => string;
  /** Which failure this step owns when the trace fails. */
  failsWith?: ErrorKind[];
};

export type WorkflowTemplate = {
  name: WorkflowName;
  inputs: readonly [string, ...string[]];
  steps: StepTemplate[];
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

/** Picks the details that belong to this run's input, so every span tells the same story. */
const caseFor =
  <Case extends { input: string }>(cases: readonly [Case, ...Case[]]) =>
  (query: string): Case =>
    cases.find((item) => item.input === query) ?? cases[0];

type SupportCase = {
  input: string;
  intent: string;
  articles: string[];
  tool: Record<string, unknown>;
  result: Record<string, unknown>;
  plan: string;
  policy: string;
  reply: string;
};

const support = caseFor<SupportCase>([
  {
    input: "Where is my refund for order #48213?",
    intent: "refund",
    articles: ["refund-timelines", "order-status"],
    tool: { order_id: "48213" },
    result: { refund: "processing", eta_days: 3 },
    plan: "1. Confirm the refund is processing.\n2. Give the 3-day ETA.\n3. Offer to escalate if not received.",
    policy: "refund escalation rules",
    reply:
      "Hi! Your refund for order #48213 is being processed and should reach your card within 3 business days.",
  },
  {
    input: "I was charged twice for my March subscription",
    intent: "billing",
    articles: ["duplicate-charges", "subscription-billing"],
    tool: { invoice_month: "2026-03", check: "duplicates" },
    result: { duplicate_found: true, amount: 49, refund_started: true },
    plan: "1. Apologize for the double charge.\n2. Confirm the duplicate refund was started.\n3. Give the 5-day ETA.",
    policy: "duplicate charge refunds",
    reply:
      "Sorry about that! We found the duplicate $49 charge for March and refunded it. It will show on your card within 5 business days.",
  },
  {
    input: "How do I change the shipping address on an open order?",
    intent: "order",
    articles: ["edit-open-order", "shipping-address"],
    tool: { order_id: "48311", action: "can_edit_address" },
    result: { editable: true, ships_on: "2026-11-01" },
    plan: "1. Confirm the order can still be edited.\n2. Point to Orders → Edit address.\n3. Mention the cut-off before shipping.",
    policy: "order edit cut-off",
    reply:
      "Good news: your order hasn't shipped yet. Open Orders → Edit address and save the new one before Nov 1, when it ships.",
  },
  {
    input: "Can I upgrade to the Team plan mid-cycle?",
    intent: "plan-change",
    articles: ["change-plan", "proration"],
    tool: { action: "preview_upgrade", to_plan: "Team" },
    result: { allowed: true, prorated_charge: 32.4, effective: "now" },
    plan: "1. Confirm upgrades work any time.\n2. Explain the prorated charge.\n3. Point to Settings → Billing.",
    policy: "plan change proration",
    reply:
      "Yes! You can upgrade any time in Settings → Billing. You'll pay a prorated $32.40 today and the Team plan starts right away.",
  },
]);

const invoice = caseFor([
  {
    input: "invoice_ACME_2026-10.pdf",
    pages: 2,
    characters: 4182,
    vendor: "Acme Corp",
    vendorId: "ven_0042",
    date: "2026-10-02",
    items: 7,
    total: 4820.5,
    billId: "bill_88213",
  },
  {
    input: "INV-00921 Northwind Traders.pdf",
    pages: 1,
    characters: 2210,
    vendor: "Northwind Traders",
    vendorId: "ven_0117",
    date: "2026-10-14",
    items: 3,
    total: 1290,
    billId: "bill_88240",
  },
  {
    input: "scan_0193.png",
    pages: 1,
    characters: 1586,
    vendor: "Fabrikam Office Supply",
    vendorId: "ven_0230",
    date: "2026-09-28",
    items: 12,
    total: 612.75,
    billId: "bill_88251",
  },
]);

const docs = caseFor([
  {
    input: "How do I rotate API keys without downtime?",
    search: "api key rotation zero downtime",
    answer:
      "Create a second key, deploy it, then revoke the old one. Both keys work during the overlap. [1][3]",
  },
  {
    input: "What are the rate limits on the batch endpoint?",
    search: "batch endpoint rate limits",
    answer:
      "The batch endpoint accepts 50 requests per minute and 10,000 items per batch. Larger jobs are queued, not rejected. [2]",
  },
  {
    input: "Does the SDK support streaming in Node 18?",
    search: "sdk streaming node 18",
    answer:
      "Yes. Streaming works on Node 18 and later through the built-in fetch; no extra polyfill is needed. [1][4]",
  },
]);

const leads = caseFor([
  {
    input: "northwind.example",
    companyId: "co_5512",
    summary: { employees: "200-500", industry: "Logistics", fit: 4 },
  },
  {
    input: "contoso.example",
    companyId: "co_5530",
    summary: { employees: "1000-5000", industry: "Manufacturing", fit: 3 },
  },
  {
    input: "fabrikam.example",
    companyId: "co_5547",
    summary: { employees: "50-200", industry: "Retail software", fit: 5 },
  },
]);

const reviews = caseFor([
  {
    input: "PR #1842 · Add retry to webhook sender",
    topic: "webhook sender retry",
    diff: { files: 6, additions: 214, deletions: 58 },
    review: { comments: 3, blocking: 1 },
    event: "REQUEST_CHANGES",
  },
  {
    input: "PR #1851 · Migrate auth to sessions",
    topic: "auth session middleware",
    diff: { files: 14, additions: 602, deletions: 377 },
    review: { comments: 5, blocking: 2 },
    event: "REQUEST_CHANGES",
  },
  {
    input: "PR #1857 · Fix flaky date test",
    topic: "date test timezone",
    diff: { files: 1, additions: 9, deletions: 4 },
    review: { comments: 1, blocking: 0 },
    event: "APPROVE",
  },
]);

export const WORKFLOWS: Record<WorkflowName, WorkflowTemplate> = {
  "support-agent": {
    name: "support-agent",
    inputs: [
      "Where is my refund for order #48213?",
      "I was charged twice for my March subscription",
      "How do I change the shipping address on an open order?",
      "Can I upgrade to the Team plan mid-cycle?",
    ],
    steps: [
      {
        name: "classify intent",
        kind: "llm",
        weight: 0.1,
        input: (query) => `System: Classify the customer message into one intent.\nUser: ${query}`,
        output: (query) => json({ intent: support(query).intent, confidence: 0.94 }),
        failsWith: ["rate-limit"],
      },
      {
        name: "search help center",
        kind: "retrieval",
        weight: 0.06,
        input: (query) => json({ index: "help-center", query, top_k: 5 }),
        output: (query) => json({ hits: 5, top: support(query).articles }),
      },
      {
        name: "crm.lookup",
        kind: "tool",
        weight: 0.17,
        input: () => json({ customer_id: "cus_31Ad9", include: ["orders", "payments"] }),
        output: () => json({ orders: 3, last_payment: "succeeded", plan: "Pro" }),
        failsWith: ["tool-timeout"],
      },
      {
        name: "billing.lookup",
        kind: "tool",
        weight: 0.28,
        parallel: true,
        input: (query) => json(support(query).tool),
        output: (query) => json(support(query).result),
      },
      {
        name: "plan reply",
        kind: "llm",
        weight: 0.22,
        input: () =>
          "System: Draft a plan for the reply using the tool results.\nContext: 2 tool results, 5 articles",
        output: (query) => support(query).plan,
        failsWith: ["context"],
      },
      {
        name: "policy check",
        kind: "retrieval",
        weight: 0.04,
        depth: 2,
        input: (query) => json({ index: "policies", query: support(query).policy }),
        output: () => json({ hits: 2, top: ["billing-policy-v4"] }),
      },
      {
        name: "write reply",
        kind: "llm",
        weight: 0.21,
        input: () => "System: Write a short, friendly reply that follows the plan.",
        output: (query) => support(query).reply,
        failsWith: ["schema"],
      },
    ],
  },
  "invoice-extractor": {
    name: "invoice-extractor",
    inputs: ["invoice_ACME_2026-10.pdf", "INV-00921 Northwind Traders.pdf", "scan_0193.png"],
    steps: [
      {
        name: "pdf.parse",
        kind: "tool",
        weight: 0.22,
        input: (file) => json({ file, ocr: true }),
        output: (file) => json({ pages: invoice(file).pages, characters: invoice(file).characters }),
        failsWith: ["tool-timeout"],
      },
      {
        name: "extract fields",
        kind: "llm",
        weight: 0.46,
        input: (file) =>
          `System: Extract vendor, date, line items and total as JSON.\nDocument: <${invoice(file).characters} chars>`,
        output: (file) => {
          const { vendor, date, items, total } = invoice(file);
          return json({ vendor, date, items, total });
        },
        failsWith: ["schema", "rate-limit", "context"],
      },
      {
        name: "vendors.match",
        kind: "retrieval",
        weight: 0.08,
        input: (file) => json({ index: "vendors", query: invoice(file).vendor }),
        output: (file) => json({ vendor_id: invoice(file).vendorId, score: 0.97 }),
      },
      {
        name: "erp.create_bill",
        kind: "tool",
        weight: 0.24,
        input: (file) =>
          json({ vendor_id: invoice(file).vendorId, total: invoice(file).total, currency: "USD" }),
        output: (file) => json({ bill_id: invoice(file).billId, status: "draft" }),
      },
    ],
  },
  "docs-search": {
    name: "docs-search",
    inputs: [
      "How do I rotate API keys without downtime?",
      "What are the rate limits on the batch endpoint?",
      "Does the SDK support streaming in Node 18?",
    ],
    steps: [
      {
        name: "rewrite query",
        kind: "llm",
        weight: 0.14,
        input: (query) => `System: Rewrite the question as a search query.\nUser: ${query}`,
        output: (query) => docs(query).search,
        failsWith: ["rate-limit"],
      },
      {
        name: "vector.search",
        kind: "retrieval",
        weight: 0.12,
        input: (query) => json({ index: "docs-v3", query: docs(query).search, top_k: 20 }),
        output: () => json({ hits: 20 }),
      },
      {
        name: "rerank",
        kind: "tool",
        weight: 0.1,
        input: () => json({ candidates: 20, top_n: 5 }),
        output: () => json({ kept: 5, best_score: 0.91 }),
        failsWith: ["tool-timeout"],
      },
      {
        name: "answer",
        kind: "llm",
        weight: 0.64,
        input: () => "System: Answer using only the provided passages and cite them.\nPassages: 5",
        output: (query) => docs(query).answer,
        failsWith: ["context", "schema"],
      },
    ],
  },
  "lead-enrichment": {
    name: "lead-enrichment",
    inputs: ["northwind.example", "contoso.example", "fabrikam.example"],
    steps: [
      {
        name: "crm.lookup",
        kind: "tool",
        weight: 0.18,
        input: (domain) => json({ domain }),
        output: (domain) => json({ company_id: leads(domain).companyId, owner: "unassigned" }),
        failsWith: ["tool-timeout"],
      },
      {
        name: "web.search",
        kind: "tool",
        weight: 0.3,
        parallel: true,
        input: (domain) => json({ query: `${domain} company size funding` }),
        output: () => json({ results: 8 }),
      },
      {
        name: "summarize company",
        kind: "llm",
        weight: 0.38,
        input: () => "System: Summarize the company and score fit from 1 to 5.\nSources: 8",
        output: (domain) => json(leads(domain).summary),
        failsWith: ["schema", "rate-limit", "context"],
      },
      {
        name: "crm.update",
        kind: "tool",
        weight: 0.14,
        input: (domain) => json({ company_id: leads(domain).companyId, fields: ["industry", "size", "fit"] }),
        output: () => json({ updated: true }),
      },
    ],
  },
  "code-review-bot": {
    name: "code-review-bot",
    inputs: [
      "PR #1842 · Add retry to webhook sender",
      "PR #1851 · Migrate auth to sessions",
      "PR #1857 · Fix flaky date test",
    ],
    steps: [
      {
        name: "github.diff",
        kind: "tool",
        weight: 0.12,
        input: (pr) => json({ pull_request: pr.split(" ")[1] }),
        output: (pr) => json(reviews(pr).diff),
        failsWith: ["tool-timeout"],
      },
      {
        name: "code context",
        kind: "retrieval",
        weight: 0.1,
        input: (pr) => json({ index: "repo", query: reviews(pr).topic }),
        output: () => json({ hits: 12 }),
      },
      {
        name: "review diff",
        kind: "llm",
        weight: 0.62,
        input: (pr) =>
          `System: Review the diff for bugs and risky changes. Reply with JSON comments.\nDiff: ${reviews(pr).diff.files} files`,
        output: (pr) => json(reviews(pr).review),
        failsWith: ["schema", "rate-limit", "context"],
      },
      {
        name: "github.comment",
        kind: "tool",
        weight: 0.16,
        input: (pr) => json({ comments: reviews(pr).review.comments, event: reviews(pr).event }),
        output: () => json({ review_id: 99120 }),
      },
    ],
  },
};

export const WORKFLOW_NAMES = [
  "support-agent",
  "invoice-extractor",
  "docs-search",
  "lead-enrichment",
  "code-review-bot",
] as const satisfies readonly WorkflowName[];

export const ERROR_MESSAGES: Record<ErrorKind, string> = {
  "tool-timeout": "Tool call timed out after 10s",
  schema: "Output failed JSON schema: missing `total`",
  "rate-limit": "Rate limited by provider (429)",
  context: "Context window exceeded (212k tokens)",
};
