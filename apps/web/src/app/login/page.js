import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <AuthForm mode="login" />
    </main>
  );
}
