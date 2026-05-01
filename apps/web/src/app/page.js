export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-[10px] px-4 py-16 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 flex flex-col justify-between md:col-span-7">
          <div>
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Collaborative Team Hub
            </p>
            <h1 className="mt-[10px] text-[clamp(3rem,10vw,8rem)] font-medium leading-[0.9] tracking-[-0.03em]">
              notFredoHub
            </h1>
            <p className="mt-[10px] max-w-[40ch] text-[20px] leading-[1] tracking-[-0.009em] opacity-70">
              Complete team management system for FredoCloud. Goals, announcements, and action items in real time.
            </p>
          </div>
          <div className="mt-[10px] flex flex-col gap-[10px] sm:flex-row">
            <a
              className="inline-flex h-[56px] items-center justify-center rounded-[300px] bg-white px-[24px] text-[20px] tracking-[-0.009em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97]"
              href="/register"
            >
              Create account
            </a>
            <a
              className="inline-flex h-[56px] items-center justify-center rounded-[300px] border border-current px-[24px] text-[20px] tracking-[-0.009em] transition-transform hover:scale-[1.02] active:scale-[0.97]"
              href="/login"
            >
              Log in
            </a>
          </div>
        </div>

        <div className="col-span-12 mt-[10px] flex flex-col justify-between border border-current p-[24px] md:col-span-5 md:mt-0">
          <div>
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Foundation
            </p>
            <p className="mt-[10px] text-[clamp(1.5rem,4vw,2.5rem)] font-medium leading-[0.95] tracking-[-0.02em]">
              Monorepo scaffold. API health live.
            </p>
          </div>
          <div className="mt-[10px] flex flex-col gap-[10px]">
            <a
              className="inline-flex h-[48px] items-center justify-center rounded-[300px] bg-white px-[20px] text-[11px] uppercase tracking-[-0.005em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97]"
              href="https://fredocloud-mohammedefaz-production.up.railway.app/api/health"
              target="_blank"
              rel="noreferrer"
            >
              Open API health
            </a>
            <div className="border border-current px-[20px] py-[16px] text-[11px] uppercase tracking-[-0.005em]">
              JavaScript-only across the repo, as required.
            </div>
          </div>
        </div>

        <div className="col-span-12 mt-[10px] grid grid-cols-2 gap-[10px] md:grid-cols-4">
          {[
            { label: "Frontend", value: "Next.js, Tailwind, Zustand, Recharts" },
            { label: "Backend", value: "Express, Prisma, PostgreSQL, Socket.io" },
            { label: "Auth", value: "JWT access + refresh cookies" },
            { label: "Deploy", value: "Railway, Cloudinary, Turborepo" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-current p-[20px]"
            >
              <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                {item.label}
              </p>
              <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-current bg-black px-4 py-[20px] text-[11px] uppercase tracking-[-0.005em] text-[#e6e6dd] md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-[10px] sm:flex-row">
          <span>notFredoHub</span>
          <span>Complete team management system for FredoCloud</span>
        </div>
      </footer>
    </main>
  );
}
