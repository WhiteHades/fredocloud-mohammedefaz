"use client";

import { useEffect, useState } from "react";

function bakeTextOnImage(bgSrc, value, label, isDark) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = 1600;
      const h = 1200;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, w, h);

      ctx.fillStyle = isDark ? "#ffffff" : "#1a1210";
      ctx.font = "bold " + Math.round(w * 0.75) + "px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
      ctx.shadowBlur = 6;
      ctx.fillText(value, w / 2, h * 0.44);

      ctx.shadowBlur = 0;
      ctx.font = Math.round(w * 0.06) + "px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
      ctx.fillText(label, w / 2, h * 0.56);

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = bgSrc;
  });
}

const STAT_DATA = [
  { value: "7", label: "Workspaces" },
  { value: "26", label: "Members" },
  { value: "200+", label: "Goals" },
  { value: "400+", label: "Items" },
];

export function useCarouselItems(isDark) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const bgSrc = isDark ? "/carousel-dark.png" : "/carousel-light.png";
    let cancelled = false;

    async function build() {
      const result = await Promise.all(
        STAT_DATA.map(async (s) => ({
          image: await bakeTextOnImage(bgSrc, s.value, s.label, isDark),
          text: "",
        }))
      );
      if (!cancelled) setItems(result);
    }

    build();
    return () => { cancelled = true; };
  }, [isDark]);

  return items;
}
