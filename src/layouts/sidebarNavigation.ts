import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Wrench } from "lucide-react";

export type SidebarNavigationItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export type SidebarNavigationGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultOpen: boolean;
  items: SidebarNavigationItem[];
};

export const sidebarNavigation: SidebarNavigationGroup[] = [
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    defaultOpen: true,
    items: [
      {
        id: "component-library",
        label: "Component Library",
        to: "/component-library",
        icon: LayoutGrid,
        match: (pathname) => pathname.startsWith("/component-library"),
      },
    ],
  },
];
