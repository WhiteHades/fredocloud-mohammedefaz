"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const THEME_LABELS = { light: "Light", dark: "Dark", system: "System" };

export function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [display, setDisplay] = useState(theme || "light");
  const prevDisplay = useRef(display);

  useEffect(() => {
    prevDisplay.current = display;
  }, [display]);

  useEffect(() => {
    if (!theme) return;
    const id = requestAnimationFrame(() => setDisplay(theme));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  const cycle = useCallback(() => {
    const order = ["light", "dark", "system"];
    const current = order.indexOf(display || "light");
    setTheme(order[(current + 1) % order.length]);
  }, [setTheme, display]);

  const label = THEME_LABELS[display] || "Light";
  const wasActive = prevDisplay.current;

  const iconStyle = (name) => ({
    opacity: display === name ? 1 : 0,
    transitionDelay: wasActive === name ? "0ms" : "70ms",
    transform: display === name
      ? "scale(1) rotate(0deg)"
      : name === "dark"
        ? "scale(0.25) rotate(90deg)"
        : name === "light"
          ? "scale(0.25) rotate(-90deg)"
          : "scale(0.25) rotate(0deg)",
    filter: display === name ? "blur(0)" : "blur(2px)",
  });

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
              style={iconStyle("light")}
            />
            <Moon
              weight="fill"
              className="theme-toggle-moon absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
              style={iconStyle("dark")}
            />
            <Desktop
              weight="fill"
              className="theme-toggle-system absolute inset-0 size-5 transition-all duration-[var(--icon-swap-dur)] ease-out"
              style={iconStyle("system")}
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
