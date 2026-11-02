import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TraceNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Trace not found</h1>
      <p className="text-sm text-muted-foreground">
        It may have expired under your retention policy, or the link has a typo.
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/traces">Back to traces</Link>
      </Button>
    </div>
  );
}
