"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  SignIn,
  UserPlus,
  House,
  ChartLineUp,
  Lightning,
  LockSimple,
  PaintBrush,
  Timer,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RotatingText from "@/components/RotatingText";
import DotGrid from "@/components/DotGrid";
import MagicBento from "@/components/MagicBento";
import CircularGallery from "@/components/CircularGallery";
import CardSwap, { Card } from "@/components/CardSwap";

const ROTATING_WORDS = ["organise", "collaborate", "ship", "grow", "decide", "build", "plan", "execute"];

const BENTO_CARDS = [
  { emoji: "\uD83C\uDFE2", title: "Workspaces", description: "Multi-workspace control — invite teammates by email, keep role-aware boundaries crisp.", label: "Multi-team" },
  { emoji: "\uD83C\uDFAF", title: "Goals", description: "Track owners, due dates, milestones and progress updates without losing the thread.", label: "Milestones" },
  { emoji: "\uD83D\uDCE3", title: "Announcements", description: "Publish rich updates, pin what matters, keep reactions and comments live.", label: "Pinned" },
  { emoji: "\u2705", title: "Action Items", description: "Kanban and list views, assign owners cleanly, explicit priorities.", label: "Kanban" },
  { emoji: "\u26A1", title: "Realtime", description: "Mentions, presence, activity feel immediate — behaves like a live hub.", label: "Live" },
  { emoji: "\uD83D\uDCCA", title: "Analytics", description: "Track totals, velocity, overdue work, export without leaving dashboard.", label: "Export" },
];

function statSvg(label, value) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#f5f0e8"/>
          <stop offset="100%" style="stop-color:#e8e4dc"/>
        </radialGradient>
      </defs>
      <rect width="1600" height="1200" fill="url(#bg)" shape-rendering="crispEdges"/>
      <text x="800" y="500" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="180" fill="#1a1a1a" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">${value}</text>
      <text x="800" y="680" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="500" font-size="52" fill="#6b6b6b" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">${label}</text>
    </svg>`
  )}`;
}

const STAT_ITEMS = [
  { image: statSvg("Workspaces", "7"), text: "" },
  { image: statSvg("Members", "26"), text: "" },
  { image: statSvg("Goals", "200+"), text: "" },
  { image: statSvg("Items", "400+"), text: "" },
];

const POLISH = [
  { icon: PaintBrush, label: "Light, dark, and system appearance controls", accent: "#ec4899", anim: "float" },
  { icon: Lightning, label: "Command palette navigation (Ctrl+K)", accent: "#f59e0b", anim: "flicker" },
  { icon: ChartLineUp, label: "Audit and workspace CSV exports", accent: "#10b981", anim: "grow" },
  { icon: LockSimple, label: "Role-aware permissions and seeded demo flows", accent: "#6366f1", anim: "pulse" },
  { icon: Timer, label: "Realtime updates tuned to feel immediate", accent: "#ef4444", anim: "tick" },
];

const STACK_LABELS = ["Next.js", "Express + Prisma", "PostgreSQL", "Zustand", "Socket.IO", "Cloudinary", "Recharts", "Railway"];

export function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setVideoReady(v.readyState >= 3);
    v.addEventListener("canplaythrough", () => setVideoReady(true), { once: true });
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.querySelectorAll(".hero-char").forEach((c, i) =>
      c.animate(
        [{ opacity: 0, transform: "translateY(50px) rotateX(50deg)" }, { opacity: 1, transform: "translateY(0) rotateX(0)" }],
        { duration: 800, delay: Math.abs(("notFredoHub".length - 1) / 2 - i) * 35, fill: "forwards", easing: "cubic-bezier(0.22,1,0.36,1)" },
      ),
    );
  }, []);

  const hero = "notFredoHub".split("").map((c, i) => (
    <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>{c}</span>
  ));
  const API_DOCS_URL = "https://fredocloud-mohammedefaz-production.up.railway.app/api/docs";

  return (
    <main className="bg-background text-foreground relative">
      {/* DOT GRID - full page background */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <DotGrid
          dotSize={2}
          gap={29}
          baseColor="#2F293A"
          activeColor="#fb2c36"
          proximity={50}
          speedTrigger={100}
          shockRadius={50}
          shockStrength={1}
          maxSpeed={8000}
          resistance={900}
          returnDuration={1.9}
        />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-4 pb-4 pt-4 md:px-6 md:pb-6">
        <div className="relative min-h-[92svh] overflow-hidden rounded-[2rem] border bg-card shadow-2xl dark:bg-black dark:border-white/10">
          <video ref={videoRef} autoPlay loop muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out dark:opacity-70" style={{ opacity: videoReady ? undefined : 0 }}>
            <source src="/ascii-art.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80 dark:from-black/40 dark:via-black/20 dark:to-black/80" />

          <div className="relative z-10 flex min-h-[92svh] flex-col">
            <header className="px-4 pt-4 md:px-6 md:pt-6">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/75 px-4 py-2 text-sm shadow-lg backdrop-blur-xl md:gap-6 md:px-8 dark:bg-black/75 dark:border-white/10 dark:text-white">
                <a href="#tagline" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">Home</a>
                <a href="#features" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">Features</a>
                <a href="#stack" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">Stack</a>
                <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">API Docs</a>
                <ThemeToggle className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white" />
                {user ? (
                  <Link href="/dashboard" className="ml-2 flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs transition hover:bg-accent dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white">
                    <House className="size-3.5" /> {user.displayName || user.email}
                  </Link>
                ) : (
                  <div className="ml-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
                      <Link href="/login"><SignIn data-icon="inline-start" /> Log in</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register"><UserPlus data-icon="inline-start" /> Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </header>

            <div className="mt-auto flex flex-col gap-8 px-6 pb-8 pt-16 md:grid md:grid-cols-12 md:px-10 md:pb-10 lg:px-14 lg:pb-14">
              <div className="md:col-span-8 lg:col-span-7">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="dark:border-white/10 dark:bg-white/10 dark:text-white">Collaborative Team Hub</Badge>
                  <Badge variant="outline" className="dark:border-white/15 dark:bg-black/20 dark:text-white/80">Realtime Planning</Badge>
                </div>
                <h1 ref={heroRef} className="font-heading text-[14vw] leading-[0.88] tracking-[-0.06em] text-foreground sm:text-[12vw] md:text-[7rem] lg:text-[9rem] dark:text-[#f4f0e6]" style={{ perspective: "600px" }}>
                  {hero}
                </h1>
              </div>
              <div className="md:col-span-4 lg:col-span-5 md:self-end md:pb-2 md:pt-10">
                <p className="text-sm leading-7 text-muted-foreground md:text-right dark:text-white/76">
                  Collaborative team hub for shared workspaces, goals, announcements, action items, realtime presence, and analytics.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
                  <Button size="lg" asChild><Link href={user ? "/dashboard" : "/login"}><SignIn data-icon="inline-start" /> {user ? "Dashboard" : "Open the App"}</Link></Button>
                  <Button variant="outline" size="lg" asChild className="dark:border-white/15 dark:bg-black/30 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
                    <a href={API_DOCS_URL} target="_blank" rel="noreferrer"><ArrowUpRight data-icon="inline-start" /> API Docs</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROTATING TAGLINE */}
      <section className="relative z-10 px-4 py-20 md:px-6" id="tagline">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl md:text-5xl flex flex-wrap items-center justify-center gap-x-3">
            <span className="text-muted-foreground whitespace-nowrap">notFredoHub helps you</span>
            <span className="inline-flex min-w-[160px] sm:min-w-[200px] justify-start">
              <RotatingText
                texts={ROTATING_WORDS}
                mainClassName="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fb2c36] via-[#fb2c36]/80 to-[#fb2c36]"
                rotationInterval={2200}
                staggerDuration={0.03}
                staggerFrom="last"
                transition={{ type: "spring", damping: 22, stiffness: 250 }}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
              />
            </span>
          </h2>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
            <CircularGallery items={STAT_ITEMS} bend={3} textColor="#ffffff" borderRadius={0.05} scrollSpeed={2} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-4 py-16 md:px-6" id="features">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="dark:border-white/10 dark:bg-white/5 dark:text-white/70">Features</Badge>
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl md:text-4xl">
              Built for teams that move fast.
            </h2>
          </div>
          <MagicBento
            cards={BENTO_CARDS}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={true}
            clickEffect={true}
            glowColor="251, 44, 54"
            spotlightRadius={250}
            particleCount={8}
          />
        </div>
      </section>

      {/* CARD SWAP - Stack + Polish */}
      <section className="relative z-10 px-4 pb-24 md:px-6" id="stack">
        <div className="mx-auto max-w-4xl">
          <div className="relative h-[420px] sm:h-[380px]">
            <CardSwap cardDistance={60} verticalDistance={70} delay={3000} pauseOnHover={true}>
              <Card className="p-6 sm:p-8 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit dark:border-white/10 dark:bg-white/5 dark:text-white/70">Stack</Badge>
                <h3 className="font-heading text-2xl mb-3">Modern full-stack stack.</h3>
                <p className="text-sm leading-7 text-muted-foreground mb-4">
                  Turborepo monorepo, Next.js App Router, Express API, Prisma/Postgres, Zustand, Socket.IO, Cloudinary, Recharts, Railway.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {STACK_LABELS.map((label) => (
                    <div key={label} className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-center text-muted-foreground dark:border-white/8 dark:bg-white/[0.02] dark:text-white/78">
                      {label}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 sm:p-8 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit dark:border-white/10 dark:bg-white/5 dark:text-white/70">Polish</Badge>
                <h3 className="font-heading text-2xl mb-3">Built to ship.</h3>
                <p className="text-sm leading-7 text-muted-foreground mb-4">Every detail tuned for speed and usability.</p>
                <div className="space-y-2">
                  {POLISH.map((p) => (
                    <div key={p.label} className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 hover:bg-muted/50 dark:hover:bg-white/5">
                      <AnimatedIcon icon={p.icon} accent={p.accent} animation={p.anim} size="sm" />
                      <span className="text-sm text-muted-foreground dark:text-white/78">{p.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                <h3 className="font-heading text-2xl">Ready to start?</h3>
                <p className="text-sm text-muted-foreground">Join teams already shipping with notFredoHub.</p>
                <Button size="lg" asChild>
                  <Link href={user ? "/dashboard" : "/login"}>
                    {user ? "Go to Dashboard" : "Try the demo"} <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>
    </main>
  );
}
