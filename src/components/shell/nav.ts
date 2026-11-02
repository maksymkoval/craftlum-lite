import {
  ActivityIcon,
  BookOpenIcon,
  CoinsIcon,
  CpuIcon,
  FlaskConicalIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  MessagesSquareIcon,
  ScrollTextIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Screens that ship in the full version; they open in the live demo. */
  pro?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

/** Where the full version of each screen can be seen. */
export const FULL_VERSION_URL = "https://craftlum.com/pricing/";
export const DEMO_URL = "https://demo.craftlum.com";

export const NAV: NavGroup[] = [
  {
    label: "Observe",
    items: [
      { label: "Overview", href: "/", icon: LayoutGridIcon },
      { label: "Traces", href: "/traces", icon: ActivityIcon },
      { label: "Sessions", href: "/sessions", icon: MessagesSquareIcon, pro: true },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Prompts", href: "/prompts", icon: ScrollTextIcon, pro: true },
      { label: "Evals", href: "/evals", icon: FlaskConicalIcon, pro: true },
      { label: "Datasets", href: "/datasets", icon: BookOpenIcon, pro: true },
    ],
  },
  {
    label: "Spend",
    items: [
      { label: "Costs", href: "/costs", icon: CoinsIcon, pro: true },
      { label: "Models", href: "/models", icon: CpuIcon, pro: true },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "API keys", href: "/api-keys", icon: KeyRoundIcon, pro: true },
      { label: "Settings", href: "/settings", icon: SettingsIcon, pro: true },
    ],
  },
];
