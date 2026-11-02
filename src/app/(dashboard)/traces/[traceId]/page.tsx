import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TraceDetail } from "@/components/traces/trace-detail";
import { getTrace, getTraces } from "@/lib/mock/traces";

/** Every demo trace is prerendered, so the site also works as a static export. */
export const generateStaticParams = () => getTraces().map((trace) => ({ traceId: trace.id }));

export const generateMetadata = async ({ params }: PageProps<"/traces/[traceId]">): Promise<Metadata> => {
  const { traceId } = await params;
  return { title: traceId };
};

export default async function TracePage({ params }: PageProps<"/traces/[traceId]">) {
  const { traceId } = await params;
  if (!getTrace(traceId)) notFound();
  return <TraceDetail traceId={traceId} />;
}
