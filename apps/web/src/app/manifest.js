export default function manifest() {
  return {
    name: "notFredoHub",
    short_name: "notFredoHub",
    description: "Collaborative team hub for shared workspaces and realtime planning.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#c8102e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
