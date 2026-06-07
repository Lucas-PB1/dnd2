"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  AuthAlert,
  AuthCard,
  AuthDivider,
  FieldError,
} from "@/features/auth/components/AuthCard";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { signUp, startGoogleLogin } from "@/features/auth/services/auth.service";

function GoogleIcon() {
  return (
    <svg aria-hidden className="size-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { loading, error, success, handleSubmit } = useAuthForm({
    onSubmit: async () => {
      setFieldErrors({});
      const errors: Record<string, string> = {};

      if (!email.trim()) errors.email = "Informe seu e-mail.";
      if (!password) errors.password = "Informe uma senha.";
      else if (password.length < 6)
        errors.password = "A senha deve ter pelo menos 6 caracteres.";
      if (password !== confirmPassword)
        errors.confirmPassword = "As senhas não coincidem.";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        throw new Error("Corrija os campos destacados.");
      }

      return signUp({
        email: email.trim(),
        password,
        confirmPassword,
      });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(undefined);
  };

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Junte-se à mesa e comece sua aventura em D&amp;D 2024."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/entrar" className="text-amber-400 hover:text-amber-300">
            Entrar
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <AuthAlert variant="error" message={error} /> : null}
        {success ? <AuthAlert variant="success" message={success} /> : null}

        <Button
          type="button"
          variant="google"
          onClick={() => startGoogleLogin("/campanha")}
          aria-label="Cadastrar com Google"
        >
          <GoogleIcon />
          Cadastrar com Google
        </Button>

        <AuthDivider />

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

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="Mínimo 6 caracteres"
              className="mt-1.5"
            />
            {fieldErrors.password ? (
              <FieldError id="password" message={fieldErrors.password} />
            ) : null}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              className="mt-1.5"
            />
            {fieldErrors.confirmPassword ? (
              <FieldError
                id="confirmPassword"
                message={fieldErrors.confirmPassword}
              />
            ) : null}
          </div>

          <Button type="submit" loading={loading}>
            Criar conta
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
