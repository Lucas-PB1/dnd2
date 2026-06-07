import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Redefinir senha",
  description: "Defina uma nova senha para sua conta",
};

export default function RedefinirSenhaPage() {
  return <ResetPasswordForm />;
}
