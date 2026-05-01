import {
  House,
  Buildings,
  Target,
  Megaphone,
  Checks,
  ChartBar,
  ActivityIcon,
  Gear,
  SignIn,
  UserPlus,
} from "@phosphor-icons/react";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/dashboard", label: "Overview", icon: ChartBar },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Buildings },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/action-items", label: "Action Items", icon: Checks },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
];

export const PALETTE_COMMANDS = [
  ...NAV_ITEMS,
  { href: "/login", label: "Log in", icon: SignIn },
  { href: "/register", label: "Register", icon: UserPlus },
];
