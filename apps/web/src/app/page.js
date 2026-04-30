export default function Home() {
  return (
    <main className="flex-1 border-b border-stone-200 bg-stone-50 text-stone-900 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50">
      <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-12 gap-4 px-4 py-16 md:gap-8 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 border border-stone-200 bg-stone-100 p-6 dark:border-stone-800 dark:bg-stone-900 md:col-span-7 md:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-900/50 dark:text-stone-50/50">
            Collaborative Team Hub
          </p>
          <h1 className="mt-6 max-w-[10ch] text-[clamp(3.25rem,10vw,7rem)] font-light leading-none tracking-tight text-balance">
            FredoHub
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-stone-900/70 dark:text-stone-50/70 md:text-lg">
            A workspace for goals, announcements, and action items, built on a strict grid, a disciplined colour system, and a live collaboration core.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="min-h-[44px] border border-[#c8102e] bg-[#c8102e] px-4 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition hover:bg-[#9d1028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8102e]"
              href="/register"
            >
              Create account
            </a>
            <a
              className="min-h-[44px] border border-stone-300 px-4 py-3 text-sm uppercase tracking-[0.22em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-700 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
              href="/login"
            >
              Log in
            </a>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 text-sm text-stone-900/70 dark:text-stone-50/70 sm:grid-cols-2">
            <div className="border border-stone-200 px-4 py-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Frontend
              </p>
              <p className="mt-3 text-base text-stone-900 dark:text-stone-50">
                Next.js App Router, Tailwind, Zustand, Recharts.
              </p>
            </div>
            <div className="border border-stone-200 px-4 py-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Backend
              </p>
              <p className="mt-3 text-base text-stone-900 dark:text-stone-50">
                Express, Prisma, PostgreSQL, Socket.io, Cloudinary.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col justify-between border border-stone-200 bg-[#c8102e] p-6 text-stone-50 dark:border-stone-800 md:col-span-5 md:p-8 lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-50/70">
              Foundation Slice
            </p>
            <p className="mt-6 max-w-[16ch] text-3xl font-light leading-tight tracking-tight md:text-4xl">
              Monorepo scaffold in place. API health next.
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-sm leading-relaxed text-stone-50/80">
            <a
              className="min-h-[44px] border border-stone-50/30 px-4 py-3 transition hover:bg-stone-50/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-50"
              href="http://localhost:4000/api/health"
              target="_blank"
              rel="noreferrer"
            >
              Open API health endpoint
            </a>
            <div className="border border-stone-50/30 px-4 py-3">
              JavaScript-only across the repo, as required by the assessment.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
