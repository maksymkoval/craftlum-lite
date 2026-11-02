import { CircleAlertIcon } from "lucide-react";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { formatClock, formatInteger } from "@/lib/format";
import type { Trace } from "@/lib/mock/traces";

type ErrorGroup = { message: string; count: number; lastSeen: number; workflows: Set<string> };

const groupErrors = (traces: Trace[]): ErrorGroup[] => {
  const groups = new Map<string, ErrorGroup>();
  for (const trace of traces) {
    if (!trace.error) continue;
    const group = groups.get(trace.error) ?? {
      message: trace.error,
      count: 0,
      lastSeen: 0,
      workflows: new Set<string>(),
    };
    group.count += 1;
    group.lastSeen = Math.max(group.lastSeen, trace.startedAt);
    group.workflows.add(trace.workflow);
    groups.set(trace.error, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
};

const summarizeWorkflows = (workflows: Set<string>) => {
  const names = [...workflows];
  const shown = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${shown} +${names.length - 2}` : shown;
};

/** Mock traces are a 1-in-25 sample; scale counts to the period's volume. */
const SAMPLE_SCALE = 25;

const VISIBLE_GROUPS = 5;

export const TopErrors = ({ traces }: { traces: Trace[] }) => {
  const allGroups = groupErrors(traces);
  const groups = allGroups.slice(0, VISIBLE_GROUPS);
  const hidden = allGroups.length - groups.length;

  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Top errors" description="Grouped by message" />
      {groups.length === 0 ? (
        <p className="px-4 pb-5 text-sm text-muted-foreground">No failed traces in this period.</p>
      ) : (
        <ul className="flex flex-col divide-y border-t">
          {groups.map((group) => (
            <li key={group.message} className="flex gap-3 px-4 py-3">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-status-critical" aria-label="Error" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-pretty">{group.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {summarizeWorkflows(group.workflows)} · last at {formatClock(group.lastSeen)}
                </p>
              </div>
              <span className="text-[13px] font-medium tabular-nums">
                {formatInteger(group.count * SAMPLE_SCALE)}
              </span>
            </li>
          ))}
          {hidden > 0 ? (
            <li className="px-4 py-3 text-[13px] text-muted-foreground">
              {hidden} more {hidden === 1 ? "group" : "groups"} in Traces
            </li>
          ) : null}
        </ul>
      )}
    </Panel>
  );
};
