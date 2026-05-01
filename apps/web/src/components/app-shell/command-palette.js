"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const COMMANDS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
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
    <div className="fixed inset-0 z-50 bg-stone-950/60 p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div
        className="mx-auto mt-20 max-w-2xl border border-stone-200 bg-stone-50 p-4 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
          Command Palette
        </p>
        <input
          autoFocus
          className="mt-4 min-h-[52px] w-full border border-stone-300 bg-stone-50 px-4 py-3 text-lg outline-none dark:border-stone-700 dark:bg-stone-950"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands…"
          type="text"
          value={query}
        />
        <div className="mt-4 grid gap-2">
          {filteredCommands.map((command) => (
            <Link
              key={command.href}
              className="min-h-[44px] border border-stone-200 px-4 py-3 text-sm uppercase tracking-[0.18em] transition hover:bg-stone-900 hover:text-stone-50 dark:border-stone-800 dark:hover:bg-stone-50 dark:hover:text-stone-950"
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
            <p className="px-4 py-3 text-sm text-stone-900/60 dark:text-stone-50/60">
              No command matches that query.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
