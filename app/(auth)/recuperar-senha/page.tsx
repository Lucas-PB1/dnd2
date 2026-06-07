import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Recupere o acesso à sua conta D&D 2024",
};

export default function RecuperarSenhaPage() {
  return <ForgotPasswordForm />;
}
