import Image from "next/image";

import { AnimeIntro } from "@/components/app-shell/anime-intro";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Register | notFredoHub",
};

export default function RegisterPage() {
  return (
    <main className="flex-1">
      <AnimeIntro>
        <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-[10px] px-4 py-16 md:px-8 md:py-20 lg:py-24">
          <div className="col-span-12 md:col-span-6" data-anime-item>
            <AuthForm mode="register" />
          </div>
          <div className="col-span-12 nfh-panel md:col-span-6" data-anime-item>
            <p className="nfh-eyebrow">Identity</p>
            <div className="mt-[10px] overflow-hidden border border-current">
              <Image
                alt="notFredoHub brand lockup"
                className="h-auto w-full object-cover"
                src="/brand-lockup.png"
                width={960}
                height={240}
                priority
              />
            </div>
            <p className="mt-[10px] text-[clamp(1.5rem,4vw,2.5rem)] leading-[0.95] tracking-[-0.02em]">
              Create your workspace identity. One account, multiple workspaces.
            </p>
            <p className="mt-[10px] text-[20px] leading-[1.1] tracking-[-0.009em] opacity-75">
              Register, join a Workspace, and move directly into operational planning instead of a marketing funnel.
            </p>
          </div>
        </section>
      </AnimeIntro>
    </main>
  );
}
