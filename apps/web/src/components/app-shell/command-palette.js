"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

const COMMANDS = [
  { href: "/", label: "Home", icon: House },
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Buildings },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/action-items", label: "Action Items", icon: Checks },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
  { href: "/login", label: "Log in", icon: SignIn },
  { href: "/register", label: "Register", icon: UserPlus },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.href}
                value={cmd.label}
                onSelect={() => {
                  router.push(cmd.href);
                  setOpen(false);
                }}
              >
                <Icon />
                {cmd.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
