import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Cadastre-se no D&D 2024",
};

export default function CadastroPage() {
  return <SignUpForm />;
}
