import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta D&D 2024",
};

function LoginFallback() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse rounded-2xl border border-amber-900/20 bg-stone-900/50 p-8">
      <div className="mx-auto h-8 w-48 rounded bg-stone-800" />
      <div className="mt-6 space-y-4">
        <div className="h-12 rounded-lg bg-stone-800" />
        <div className="h-12 rounded-lg bg-stone-800" />
        <div className="h-12 rounded-lg bg-stone-800" />
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
