"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  AuthAlert,
  AuthCard,
  FieldError,
} from "@/features/auth/components/AuthCard";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { forgotPassword } from "@/features/auth/services/auth.service";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { loading, error, success, handleSubmit } = useAuthForm({
    onSubmit: async () => {
      setFieldErrors({});
      if (!email.trim()) {
        setFieldErrors({ email: "Informe seu e-mail." });
        throw new Error("Corrija os campos destacados.");
      }
      return forgotPassword({ email: email.trim() });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(undefined);
  };

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha."
      footer={
        <Link href="/entrar" className="text-amber-400 hover:text-amber-300">
          Voltar para entrar
        </Link>
      }
    >
      <div className="space-y-4">
        {error ? <AuthAlert variant="error" message={error} /> : null}
        {success ? (
          <AuthAlert
            variant="success"
            message={
              success ??
              "Se o e-mail existir, você receberá instruções em instantes."
            }
          />
        ) : null}

        {!success ? (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                placeholder="aventureiro@exemplo.com"
                className="mt-1.5"
              />
              {fieldErrors.email ? (
                <FieldError id="email" message={fieldErrors.email} />
              ) : null}
            </div>

            <Button type="submit" loading={loading}>
              Enviar link
            </Button>
          </form>
        ) : null}
      </div>
    </AuthCard>
  );
}
