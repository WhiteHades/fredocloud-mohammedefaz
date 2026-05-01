export default function manifest() {
  return {
    name: "FredoHub",
    short_name: "FredoHub",
    description: "Collaborative team hub for workspaces, goals, announcements, and action items.",
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
