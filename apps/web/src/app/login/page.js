import Image from "next/image";

import { AnimeIntro } from "@/components/app-shell/anime-intro";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Log in | notFredoHub",
};

export default function LoginPage() {
  return (
    <main className="flex-1">
      <AnimeIntro>
        <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-[10px] px-4 py-16 md:px-8 md:py-20 lg:py-24">
          <div className="col-span-12 md:col-span-6" data-anime-item>
            <AuthForm mode="login" />
          </div>
          <div className="col-span-12 nfh-panel md:col-span-6" data-anime-item>
            <p className="nfh-eyebrow">Operator Entry</p>
            <div className="mt-[10px] overflow-hidden border border-current">
              <Image
                alt="notFredoHub brand banner"
                className="h-auto w-full object-cover"
                src="/brand-banner.png"
                width={1600}
                height={900}
                priority
              />
            </div>
            <div className="mt-[10px] flex items-center justify-between gap-[10px]">
              <Image alt="notFredoHub lockup" src="/brand-lockup.svg" width={320} height={80} />
              <div className="nfh-subpanel">
                <p className="nfh-eyebrow">Demo account</p>
                <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">demo@notfredohub.test</p>
                <p className="mt-[10px] nfh-muted">password: demo12345</p>
              </div>
            </div>
          </div>
        </section>
      </AnimeIntro>
    </main>
  );
}
