import { formatDay, formatDuration, formatPercent, formatUsd, formatUsdPrecise } from "@/lib/format";
import type { Insight } from "@/components/ui/briefing";
import type { DailyPoint, PeriodSummary } from "@/lib/mock/metrics";
import { MODELS } from "@/lib/mock/models";

export type ChartAnnotation = { pin: number; date: string; label: string };

export type OverviewInsights = {
  insights: Insight[];
  latency: ChartAnnotation[];
  spend: ChartAnnotation[];
};

const SLO_MS = 6_000;

const median = (values: number[]) => {
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const dailyCost = (point: DailyPoint) => MODELS.reduce((sum, model) => sum + point[model.id], 0);

const errorRate = (point: DailyPoint) => point.errors / Math.max(point.requests, 1);

/** Turns a period of metrics into three ranked statements with chart pins. */
export const buildOverviewInsights = (current: PeriodSummary, previous: PeriodSummary): OverviewInsights => {
  const previousDaily = previous.daily;
  const insights: Insight[] = [];
  const latency: ChartAnnotation[] = [];
  const spend: ChartAnnotation[] = [];
  let pin = 1;

  // 1. Reliability: the worst error day, if it stands out from the period.
  const worst = current.daily.reduce((a, b) => (errorRate(b) > errorRate(a) ? b : a));
  const typical = median(current.daily.map(errorRate));
  if (worst && errorRate(worst) > typical * 2) {
    const breached = worst.p95 > SLO_MS;
    insights.push({
      id: "incident",
      tone: "bad",
      headline: `Errors peaked at ${formatPercent(errorRate(worst), 1)} on ${formatDay(worst.date)}`,
      detail: breached
        ? `p95 latency reached ${formatDuration(worst.p95)} the same day, over the ${formatDuration(SLO_MS)} SLO.`
        : `That is ${Math.round(errorRate(worst) / Math.max(typical, 1e-9))}× the period's typical day.`,
      pin,
    });
    latency.push({ pin, date: worst.date, label: "Rate-limit incident" });
    pin += 1;
  } else {
    insights.push({
      id: "steady",
      tone: "good",
      headline: `Error rate held near ${formatPercent(typical, 1)}`,
      detail: "No day stood out from the rest of the period.",
    });
  }

  // 2. Spend: change vs the previous period and which model drove it.
  const spendChange = (current.cost - previous.cost) / Math.max(previous.cost, 1);
  const driver = MODELS.map((model) => ({
    model,
    delta:
      current.daily.reduce((sum, point) => sum + point[model.id], 0) -
      previousDaily.reduce((sum, point) => sum + point[model.id], 0),
  })).reduce((a, b) => (b.delta > a.delta ? b : a));

  const jump = current.daily.reduce(
    (best, point, index) => {
      const before = current.daily[index - 1];
      const step = before ? dailyCost(point) - dailyCost(before) : 0;
      return step > best.step ? { point, step } : best;
    },
    { point: current.daily[0], step: 0 },
  );

  const spendPin = jump.point && jump.step > 0 ? pin : undefined;
  if (spendPin && jump.point) {
    spend.push({ pin: spendPin, date: jump.point.date, label: "Traffic step-up" });
    pin += 1;
  }
  insights.push({
    id: "spend",
    tone: spendChange > 0.15 ? "warning" : "neutral",
    headline: `Spend ${spendChange >= 0 ? "up" : "down"} ${formatPercent(Math.abs(spendChange), 0)} to ${formatUsd(current.cost)}`,
    detail: `${driver.model.name} accounts for ${formatUsd(Math.max(driver.delta, 0))} of the change${
      spendPin && jump.point ? `, starting with the traffic jump on ${formatDay(jump.point.date)}` : ""
    }.`,
    pin: spendPin,
  });

  // 3. Efficiency: cost per request, the number that decides margins.
  const perRequest = current.cost / Math.max(current.requests, 1);
  const previousPerRequest = previous.cost / Math.max(previous.requests, 1);
  const efficiencyChange = (perRequest - previousPerRequest) / Math.max(previousPerRequest, 1e-9);
  insights.push({
    id: "efficiency",
    tone: efficiencyChange <= 0.02 ? "good" : "warning",
    headline: `Cost per request ${efficiencyChange <= 0 ? "down" : "up"} ${formatPercent(Math.abs(efficiencyChange), 1)}`,
    detail:
      efficiencyChange <= 0.02
        ? `Now ${formatUsdPrecise(perRequest)} per request, so higher spend is mostly more traffic, not pricier calls.`
        : `Now ${formatUsdPrecise(perRequest)} per request. Check prompt length and model mix on the busiest workflows.`,
  });

  return { insights, latency, spend };
};
