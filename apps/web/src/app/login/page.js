import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Log in | notFredoHub",
};

export default function LoginPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-[10px] px-4 py-16 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 md:col-span-7">
          <AuthForm mode="login" />
        </div>
        <div className="col-span-12 border border-current p-[24px] md:col-span-5">
          <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
            Access Pattern
          </p>
          <p className="mt-[10px] text-[clamp(1.5rem,4vw,2.5rem)] font-medium leading-[0.95] tracking-[-0.02em]">
            A clean route in front, a guarded session behind it.
          </p>
        </div>
      </section>
    </main>
  );
}
