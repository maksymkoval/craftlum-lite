import { createRandom, DEMO_NOW } from "./random";
import { MODELS, type ModelId } from "./models";

export type DailyPoint = {
  date: string;
  requests: number;
  errors: number;
  p50: number;
  p95: number;
} & Record<ModelId, number>;

const DAY = 86_400_000;

const isoDay = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

/**
 * Daily traffic ending at DEMO_NOW: weekday rhythm, a launch bump 12 days ago
 * and a latency/error incident 9 days ago, so the charts have something to say.
 */
export const buildDaily = (days = 28): DailyPoint[] => {
  const random = createRandom(7);
  const shares: Record<ModelId, number> = {
    "claude-sonnet": 0.46,
    "gpt-large": 0.24,
    "gemini-flash": 0.2,
    "llama-70b": 0.1,
  };

  const incidentIndex = days - 9;
  const launchIndex = days - 12;

  return Array.from({ length: days }, (_, index) => {
    const timestamp = DEMO_NOW - (days - 1 - index) * DAY;
    const weekday = new Date(timestamp).getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    const growth = 1 + (index - days) * 0.006 + (index > launchIndex ? 0.22 : 0);
    const requests = Math.round((weekend ? 21_000 : 34_000) * growth * random.between(0.92, 1.08));
    const errorRate = index === incidentIndex ? 0.041 : random.between(0.008, 0.017);
    const costPerRequest = random.between(0.0068, 0.0078);
    const totalCost = requests * costPerRequest;

    const perModel = Object.fromEntries(
      MODELS.map((model) => [
        model.id,
        Number((totalCost * shares[model.id] * random.between(0.9, 1.1)).toFixed(2)),
      ]),
    ) as Record<ModelId, number>;

    return {
      date: isoDay(timestamp),
      requests,
      errors: Math.round(requests * errorRate),
      p50: Math.round(random.between(1_050, 1_350)),
      p95: Math.round(random.between(3_900, 4_700) + (index === incidentIndex ? 2_300 : 0)),
      ...perModel,
    };
  });
};

export type PeriodSummary = {
  requests: number;
  errorRate: number;
  p95: number;
  cost: number;
  daily: DailyPoint[];
};

const summarize = (points: DailyPoint[]): Omit<PeriodSummary, "daily"> => {
  const requests = points.reduce((sum, point) => sum + point.requests, 0);
  const errors = points.reduce((sum, point) => sum + point.errors, 0);
  const cost = points.reduce(
    (sum, point) => sum + MODELS.reduce((inner, model) => inner + point[model.id], 0),
    0,
  );
  const p95 = points.reduce((sum, point) => sum + point.p95, 0) / Math.max(points.length, 1);
  return { requests, errorRate: errors / Math.max(requests, 1), p95, cost };
};

export const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 28, label: "Last 28 days" },
] as const;

export type RangeDays = (typeof RANGES)[number]["days"];

/** Current period vs the period of equal length before it. */
const HISTORY_DAYS = 56;
let history: DailyPoint[] | undefined;

/** One canonical 56-day history, so every screen agrees on the same numbers. */
export const getDaily = (days: number): DailyPoint[] => {
  history ??= buildDaily(HISTORY_DAYS);
  return history.slice(-Math.min(days, HISTORY_DAYS));
};

export const dailyCost = (point: DailyPoint) => MODELS.reduce((sum, model) => sum + point[model.id], 0);

export const buildOverview = (days: RangeDays) => {
  const all = getDaily(days * 2);
  const previous = all.slice(0, days);
  const current = all.slice(days);
  return {
    current: { ...summarize(current), daily: current },
    previous: { ...summarize(previous), daily: previous },
  };
};
