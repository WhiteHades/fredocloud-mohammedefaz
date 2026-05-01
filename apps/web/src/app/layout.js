import { CommandPalette } from "@/components/app-shell/command-palette";
import { ServiceWorkerRegister } from "@/components/app-shell/service-worker-register";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "https://notfredohub.mohammedefaz.com",
  ),
  title: "notFredoHub",
  description: "Complete team management system for FredoCloud.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "notFredoHub",
    description: "Complete team management system for FredoCloud.",
    images: [
      {
        url: "/brand-banner.png",
        width: 1600,
        height: 900,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
