export type DiffLine =
  | { kind: "same"; text: string; oldLine: number; newLine: number }
  | { kind: "added"; text: string; newLine: number }
  | { kind: "removed"; text: string; oldLine: number };

/**
 * Line diff via longest common subsequence. Prompts are short, so the
 * O(n·m) table is cheap and the output is easy to read.
 */
export const diffLines = (before: string, after: string): DiffLine[] => {
  const a = before.split("\n");
  const b = after.split("\n");
  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      const row = table[i];
      if (!row) continue;
      row[j] =
        a[i] === b[j] ? (table[i + 1]?.[j + 1] ?? 0) + 1 : Math.max(table[i + 1]?.[j] ?? 0, row[j + 1] ?? 0);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const left = a[i] ?? "";
    const right = b[j] ?? "";
    if (left === right) {
      lines.push({ kind: "same", text: left, oldLine: i + 1, newLine: j + 1 });
      i += 1;
      j += 1;
    } else if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      lines.push({ kind: "removed", text: left, oldLine: i + 1 });
      i += 1;
    } else {
      lines.push({ kind: "added", text: right, newLine: j + 1 });
      j += 1;
    }
  }
  for (; i < a.length; i += 1) lines.push({ kind: "removed", text: a[i] ?? "", oldLine: i + 1 });
  for (; j < b.length; j += 1) lines.push({ kind: "added", text: b[j] ?? "", newLine: j + 1 });
  return lines;
};
