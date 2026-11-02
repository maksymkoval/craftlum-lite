import { Panel, PanelHeader } from "@/components/ui/panel";
import { formatPercent, formatUsd } from "@/lib/format";
import type { DailyPoint } from "@/lib/mock/metrics";
import { MODELS } from "@/lib/mock/models";

export const ModelBreakdown = ({ data }: { data: DailyPoint[] }) => {
  const rows = MODELS.map((model) => ({
    model,
    cost: data.reduce((sum, point) => sum + point[model.id], 0),
  }));
  const total = rows.reduce((sum, row) => sum + row.cost, 0);
  const max = Math.max(...rows.map((row) => row.cost));

  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Cost share" description={`${formatUsd(total)} across ${rows.length} models`} />
      <ul className="flex flex-1 flex-col justify-center gap-4 px-4 pb-5">
        {rows.map(({ model, cost }) => (
          <li key={model.id}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-[3px]" style={{ background: model.colorVar }} />
                <span className="truncate font-mono text-[12.5px]">{model.name}</span>
              </span>
              <span className="tabular-nums">{formatUsd(cost)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(cost / max) * 100}%`, background: model.colorVar }}
                />
              </div>
              <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                {formatPercent(cost / total, 0)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {model.provider} · {formatUsd(model.inputPrice)} in / {formatUsd(model.outputPrice)} out per 1M
              tokens
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
};
