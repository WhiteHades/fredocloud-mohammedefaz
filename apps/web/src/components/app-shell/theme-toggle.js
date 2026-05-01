"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle({ align = "end", buttonClassName = "" }) {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const label = useMemo(() => {
    if (theme === "system") {
      return `System (${THEME_LABELS[resolvedTheme] || "Light"})`;
    }

    return THEME_LABELS[theme] || "Theme";
  }, [resolvedTheme, theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={buttonClassName}>
          Theme: {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme || "light"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
