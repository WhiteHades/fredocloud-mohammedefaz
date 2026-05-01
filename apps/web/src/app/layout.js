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
  title: "notFredoHub",
  description: "Complete team management system for FredoCloud.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "notFredoHub",
    description: "Complete team management system for FredoCloud.",
    images: "/icon.svg",
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
