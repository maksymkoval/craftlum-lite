import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { UsageMeter } from "./usage-meter";

export const SidebarContent = () => (
  <div className="flex h-full flex-col gap-5 py-4">
    <div className="px-5">
      <Logo />
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-3">
      <SidebarNav />
    </div>
    <div className="px-3">
      <UsageMeter />
    </div>
  </div>
);

export const AppSidebar = () => (
  <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-sidebar lg:block">
    <SidebarContent />
  </aside>
);
