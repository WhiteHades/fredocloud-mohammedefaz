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
import { PALETTE_COMMANDS } from "@/lib/navigation";

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
          {PALETTE_COMMANDS.map((cmd) => {
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
