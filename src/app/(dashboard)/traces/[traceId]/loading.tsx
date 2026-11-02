export default function TraceLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="h-10 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-20 animate-pulse rounded-lg border bg-card" />
      <div className="h-96 animate-pulse rounded-lg border bg-card" />
    </div>
  );
}
