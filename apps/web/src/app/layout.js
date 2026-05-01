import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";

import { Providers } from "@/components/app-shell/providers";
import { CommandPalette } from "@/components/app-shell/command-palette";
import { ServiceWorkerRegister } from "@/components/app-shell/service-worker-register";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMonoHeading = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "https://notfredohub.mohammedefaz.com"
  ),
  title: {
    default: "notFredoHub",
    template: "%s | notFredoHub",
  },
  description: "Collaborative team hub for FredoCloud — goals, announcements, and action items in real time.",
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
    description: "Collaborative team hub for FredoCloud.",
    images: [{ url: "/brand-banner.png", width: 1600, height: 900 }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${geistMonoHeading.variable} ${fontMono.variable} antialiased`}
    >
      <body>
        <Providers>
          <ServiceWorkerRegister />
          <CommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}
