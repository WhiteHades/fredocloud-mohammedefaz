"use client";

import { useEffect, useState } from "react";

function renderSilkFrame({ color, value, label, width = 800, height = 600 }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const timeOffset = Math.random() * 10;
  const noiseIntensity = 1.5;
  const uScale = 1;
  const uRotation = 0.5;
  const G = Math.E;

  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      const idx = (py * width + px) * 4;
      const rx = G * Math.sin(G * (px + py * 0.1));
      const ry = G * Math.sin(G * (py + px * 0.1));
      const rnd = ((rx * ry * (1 + px)) % 1);
      const uvX = px / width;
      const uvY = py / height;
      const cosA = Math.cos(uRotation);
      const sinA = Math.sin(uRotation);
      const rotX = cosA * uvX * uScale - sinA * uvY * uScale;
      const rotY = sinA * uvX * uScale + cosA * uvY * uScale;
      let texX = rotX * uScale;
      let texY = rotY * uScale;
      const tOffset = 0.1 * timeOffset;
      texY += 0.03 * Math.sin(8 * texX - tOffset);
      const pattern = 0.6 + 0.4 * Math.sin(5 * (texX + texY + Math.cos(3 * texX + 5 * texY) + 0.02 * tOffset) + Math.sin(20 * (texX + texY - 0.1 * tOffset)));

      imageData.data[idx] = Math.min(255, Math.max(0, Math.round(r * pattern - (rnd / 15) * noiseIntensity * 255)));
      imageData.data[idx + 1] = Math.min(255, Math.max(0, Math.round(g * pattern - (rnd / 15) * noiseIntensity * 255)));
      imageData.data[idx + 2] = Math.min(255, Math.max(0, Math.round(b * pattern - (rnd / 15) * noiseIntensity * 255)));
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold " + Math.round(width * 0.22) + "px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;
  ctx.fillText(value, width / 2, height * 0.42);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = Math.round(width * 0.065) + "px system-ui, -apple-system, sans-serif";
  ctx.fillText(label, width / 2, height * 0.62);

  return canvas.toDataURL("image/png");
}

const STAT_DATA = [
  { value: "7", label: "Workspaces" },
  { value: "26", label: "Members" },
  { value: "200+", label: "Goals" },
  { value: "400+", label: "Items" },
];

export function useSilkCarouselItems(isDark) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const color = isDark ? "#2a1a18" : "#fef5f3";
    const result = STAT_DATA.map((s) => ({
      image: renderSilkFrame({ color, value: s.value, label: s.label }),
      text: "",
    }));
    setItems(result);
  }, [isDark]);

  return items;
}
