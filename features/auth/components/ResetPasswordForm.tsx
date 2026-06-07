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
import { updatePassword } from "@/features/auth/services/auth.service";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { loading, error, handleSubmit } = useAuthForm({
    onSubmit: async () => {
      setFieldErrors({});
      const errors: Record<string, string> = {};

      if (!password) errors.password = "Informe a nova senha.";
      else if (password.length < 6)
        errors.password = "A senha deve ter pelo menos 6 caracteres.";
      if (password !== confirmPassword)
        errors.confirmPassword = "As senhas não coincidem.";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        throw new Error("Corrija os campos destacados.");
      }

      return updatePassword({ password, confirmPassword });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(undefined);
  };

  return (
    <AuthCard
      title="Nova senha"
      subtitle="Escolha uma senha segura para sua conta."
      footer={
        <Link href="/entrar" className="text-amber-400 hover:text-amber-300">
          Voltar para entrar
        </Link>
      }
    >
      <div className="space-y-4">
        {error ? <AuthAlert variant="error" message={error} /> : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="password">Nova senha</Label>
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
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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
            Salvar senha
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
