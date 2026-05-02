"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const THEME_LABELS = { light: "Light", dark: "Dark", system: "System" };

export function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [display, setDisplay] = useState(theme || "light");
  const prevTheme = useRef(theme);

  useLayoutEffect(() => {
    if (theme === prevTheme.current) return;
    prevTheme.current = theme;
    const timer = requestAnimationFrame(() => setDisplay(theme));
    return () => cancelAnimationFrame(timer);
  }, [theme]);

  const cycle = useCallback(() => {
    const order = ["light", "dark", "system"];
    const current = order.indexOf(display || "light");
    setTheme(order[(current + 1) % order.length]);
  }, [setTheme, display]);

  const label = THEME_LABELS[display] || "Light";
  const isSystem = display === "system";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycle}
          aria-label={`Theme: ${label}`}
          className={className}
        >
          <span className="theme-toggle-icon relative flex size-5 items-center justify-center [--icon-swap-dur:300ms]">
            <Sun
              weight="fill"
              className="theme-toggle-sun absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
              style={{
                opacity: display === "light" ? 1 : 0,
                transform: display === "light" ? "scale(1) rotate(0deg)" : "scale(0.25) rotate(-90deg)",
                filter: display === "light" ? "blur(0)" : "blur(2px)",
              }}
            />
            <Moon
              weight="fill"
              className="theme-toggle-moon absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
              style={{
                opacity: display === "dark" ? 1 : 0,
                transform: display === "dark" ? "scale(1) rotate(0deg)" : "scale(0.25) rotate(90deg)",
                filter: display === "dark" ? "blur(0)" : "blur(2px)",
              }}
            />
            <Desktop
              weight="fill"
              className="theme-toggle-system absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
              style={{
                opacity: isSystem ? 1 : 0,
                transform: isSystem ? "scale(1) rotate(0deg)" : "scale(0.25) rotate(0deg)",
                filter: isSystem ? "blur(0)" : "blur(2px)",
              }}
            />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Theme: {label}
      </TooltipContent>
    </Tooltip>
  );
}
