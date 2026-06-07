"use client";

import { useCallback, useState } from "react";

type UseAuthFormOptions<T> = {
  onSubmit: (values: T) => Promise<{ redirectTo?: string; message?: string }>;
  onSuccess?: (result: { redirectTo?: string; message?: string }) => void;
};

export function useAuthForm<T>({ onSubmit, onSuccess }: UseAuthFormOptions<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: T) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const result = await onSubmit(values);
        if (result.message) {
          setSuccess(result.message);
        }
        onSuccess?.(result);
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, onSuccess],
  );

  return { loading, error, success, handleSubmit, setError };
}
