import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <AuthForm mode="register" />
    </main>
  );
}
