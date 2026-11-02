import type { ReactNode } from "react";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { Topbar } from "@/components/shell/topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
