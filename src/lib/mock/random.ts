/**
 * Deterministic PRNG (mulberry32). Mock data must render identically on the
 * server and the client, so nothing in the demo reads Math.random or Date.now.
 */
export const createRandom = (seed: number) => {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const between = (min: number, max: number) => min + next() * (max - min);
  const int = (min: number, max: number) => Math.floor(between(min, max + 1));
  const pick = <T>(items: readonly [T, ...T[]]): T => items[Math.floor(next() * items.length)] ?? items[0];

  return { next, between, int, pick };
};

/** Fixed "now" for the demo dataset. */
export const DEMO_NOW = Date.UTC(2026, 9, 30, 14, 20, 0);
