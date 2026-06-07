import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleSignInForm } from "@/features/auth";
import { SignInFallback } from "./SignInFallback";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com Google no D&D 2024",
};

export default function EntrarPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <GoogleSignInForm />
    </Suspense>
  );
}
