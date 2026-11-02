const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const clock = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export const formatCompact = (value: number) => compact.format(value);
export const formatInteger = (value: number) => integer.format(value);
export const formatUsd = (value: number) => usd.format(value);
export const formatUsdPrecise = (value: number) => usdPrecise.format(value);
export const formatPercent = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;

export const formatDuration = (ms: number) => {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};

/** Dates are formatted in UTC so server and client output always match. */
export const formatDay = (isoDate: string) => shortDate.format(new Date(`${isoDate}T00:00:00Z`));
export const formatClock = (timestamp: number) => `${clock.format(timestamp)} UTC`;

export const relativeChange = (current: number, previous: number) =>
  previous === 0 ? 0 : (current - previous) / previous;
