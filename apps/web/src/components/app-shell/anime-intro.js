"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export function AnimeIntro({ children, selector = "[data-anime-item]" }) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    const host = scopeRef.current;
    if (!host) return;
    const items = host.querySelectorAll(selector);
    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
    });
  }, [selector]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const host = scopeRef.current;
      if (!host) return;

      const items = host.querySelectorAll(selector);
      if (!items.length) return;

      const existing = window.anime;
      if (!existing) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/vendor/anime.umd.min.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        } catch {
          items.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "none";
          });
          return;
        }
      }

      if (cancelled) return;

      const anime = window.anime;
      if (!anime) {
        items.forEach((item) => {
          item.style.opacity = "1";
          item.style.transform = "none";
        });
        return;
      }

      anime.animate(items, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(70),
        duration: 700,
        ease: "inOutQuint",
      });
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [selector]);

  return <div ref={scopeRef}>{children}</div>;
}
