export type ModelId = "claude-sonnet" | "gpt-large" | "gemini-flash" | "llama-70b";

export type Model = {
  id: ModelId;
  name: string;
  provider: string;
  /** USD per 1M tokens */
  inputPrice: number;
  outputPrice: number;
  /** Categorical slot, assigned once per entity and never re-ranked. */
  colorVar: `var(--chart-${1 | 2 | 3 | 4})`;
};

export const MODELS = [
  {
    id: "claude-sonnet",
    name: "claude-sonnet-4.5",
    provider: "Anthropic",
    inputPrice: 3,
    outputPrice: 15,
    colorVar: "var(--chart-1)",
  },
  {
    id: "gpt-large",
    name: "gpt-5",
    provider: "OpenAI",
    inputPrice: 1.25,
    outputPrice: 10,
    colorVar: "var(--chart-2)",
  },
  {
    id: "gemini-flash",
    name: "gemini-2.5-flash",
    provider: "Google",
    inputPrice: 0.3,
    outputPrice: 2.5,
    colorVar: "var(--chart-3)",
  },
  {
    id: "llama-70b",
    name: "llama-3.3-70b",
    provider: "Groq",
    inputPrice: 0.59,
    outputPrice: 0.79,
    colorVar: "var(--chart-4)",
  },
] as const satisfies readonly Model[];

export const getModel = (id: ModelId): Model => {
  const model = MODELS.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Unknown model: ${id}`);
  return model;
};

export const tokenCost = (id: ModelId, tokensIn: number, tokensOut: number) => {
  const model = getModel(id);
  return (tokensIn * model.inputPrice + tokensOut * model.outputPrice) / 1_000_000;
};
