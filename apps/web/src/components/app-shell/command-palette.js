"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const COMMANDS = [
  { href: "/", label: "Entry" },
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/workspaces", label: "Workspaces" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/announcements", label: "Announcements" },
  { href: "/dashboard/action-items", label: "Action Items" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setIsOpen((currentValue) => !currentValue);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredCommands = useMemo(
    () => COMMANDS.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-[2px]" onClick={() => setIsOpen(false)}>
      <div
        className="mx-auto mt-20 max-w-2xl border border-current bg-background p-[24px] text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="nfh-eyebrow">Command Palette</p>
        <input
          autoFocus
          className="nfh-input mt-[10px] h-[56px] outline-none focus:ring-2 focus:ring-accent"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands…"
          type="text"
          value={query}
        />
        <div className="mt-[10px] grid gap-[10px]">
          {filteredCommands.map((command) => (
            <Link
              key={command.href}
              className="nfh-chip"
              href={command.href}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
            >
              {command.label}
            </Link>
          ))}
          {!filteredCommands.length ? (
            <p className="nfh-muted px-[16px] py-[12px]">No command matches that query.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
