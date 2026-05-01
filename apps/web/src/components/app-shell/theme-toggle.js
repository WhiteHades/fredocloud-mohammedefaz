"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const cycle = useCallback(() => {
    const order = ["light", "dark", "system"];
    const current = order.indexOf(theme || "light");
    setTheme(order[(current + 1) % order.length]);
  }, [setTheme, theme]);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      title={`Theme: ${isDark ? "Dark" : "Light"} (click to cycle)`}
      className={className}
    >
      <span className="theme-toggle-icon relative flex size-5 items-center justify-center [--icon-swap-dur:350ms]">
        <Sun
          weight="fill"
          className="theme-toggle-sun absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "scale(0.25) rotate(-90deg)" : "scale(1) rotate(0deg)",
            filter: isDark ? "blur(2px)" : "blur(0)",
          }}
        />
        <Moon
          weight="fill"
          className="theme-toggle-moon absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.25) rotate(90deg)",
            filter: isDark ? "blur(0)" : "blur(2px)",
          }}
        />
      </span>
    </Button>
  );
}
