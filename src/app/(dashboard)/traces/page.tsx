import type { Metadata } from "next";
import { Suspense } from "react";

import { TracesExplorer } from "@/components/traces/traces-explorer";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Traces" };

const ExplorerFallback = () => (
  <div className="flex flex-col gap-4" aria-busy="true">
    <div className="h-8 w-full max-w-xl animate-pulse rounded-md bg-muted" />
    <div className="h-[640px] animate-pulse rounded-lg border bg-card" />
  </div>
);

export default function TracesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Traces"
        description="Every agent run, with its input, model, cost and outcome. Open one to see each step."
      />
      <Suspense fallback={<ExplorerFallback />}>
        <TracesExplorer />
      </Suspense>
    </div>
  );
}
