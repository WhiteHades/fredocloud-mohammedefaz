import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { CommandPalette } from "@/components/app-shell/command-palette";
import { ServiceWorkerRegister } from "@/components/app-shell/service-worker-register";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "notFredoHub",
    description: "Complete team management system for FredoCloud.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
