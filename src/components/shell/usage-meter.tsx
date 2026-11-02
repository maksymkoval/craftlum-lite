import { ArrowUpRightIcon } from "lucide-react";

import { FULL_VERSION_URL } from "./nav";

/** Lite shows three screens; this card points to the other fourteen. */
export const UsageMeter = () => (
  <a
    href={FULL_VERSION_URL}
    className="block rounded-lg border bg-card px-3 py-3 transition-colors hover:border-foreground/20"
  >
    <p className="text-[13px] font-medium">Craftlum Lite</p>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">
      The full version adds sessions, prompts, evals, datasets, costs, models, API keys, settings and auth.
    </p>
    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium">
      Get all 17 screens <ArrowUpRightIcon className="size-3" aria-hidden="true" />
    </p>
  </a>
);
