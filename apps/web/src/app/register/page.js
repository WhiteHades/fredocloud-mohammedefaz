import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Register | FredoHub",
};

export default function RegisterPage() {
  return (
    <main className="flex-1 border-b border-stone-200 bg-stone-50 text-stone-900 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50">
      <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-12 gap-4 px-4 py-16 md:gap-8 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 md:col-span-7">
          <AuthForm mode="register" />
        </div>
        <div className="col-span-12 border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-950 md:col-span-5 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-900/45 dark:text-stone-50/45">Account Setup</p>
          <p className="mt-6 max-w-[18ch] text-3xl font-light leading-tight tracking-tight md:text-4xl">
            One identity, many workspaces, clear boundaries.
          </p>
        </div>
      </section>
    </main>
  );
}
