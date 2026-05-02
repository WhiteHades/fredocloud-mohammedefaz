"use client";

import { cn } from "@/lib/utils";

const animations = {
  pulse: "icon-pulse",
  grow: "icon-grow",
  ripple: "icon-ripple",
  flicker: "icon-flicker",
  orbit: "icon-orbit",
  bounce: "icon-bounce",
  sweep: "icon-sweep",
  wave: "icon-wave",
  tick: "icon-tick",
  draw: "icon-draw",
  float: "icon-float",
  spin: "icon-spin",
};

export function AnimatedIcon({
  icon: Icon,
  accent,
  size = "md",
  animation = "pulse",
  className,
}) {
  const sizeClasses = {
    sm: "size-8 text-sm",
    md: "size-10 text-base",
    lg: "size-12 text-lg",
    xl: "size-14 text-xl",
  };

  const animClass = animations[animation] || animations.pulse;

  return (
    <div
      className={cn(
        "animated-icon relative flex shrink-0 items-center justify-center rounded-xl border shadow-inner transition-shadow duration-300 hover:shadow-lg",
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: `${accent}0f`,
        borderColor: `${accent}30`,
        color: accent,
      }}
    >
      <Icon
        className={cn("animated-icon-inner relative z-10 transition-transform duration-300", animClass)}
      />
      <span
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at center, ${accent}20, transparent 70%)` }}
      />
    </div>
  );
}
