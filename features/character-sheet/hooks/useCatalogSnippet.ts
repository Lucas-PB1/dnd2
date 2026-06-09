"use client";

import { useCallback, useState } from "react";

export type CatalogSnippetType = "trait" | "feat" | "spell";

type CatalogSnippetState = {
  loading: boolean;
  description: string | null;
  error: string | null;
};

export function useCatalogSnippet(characterId: number) {
  const [state, setState] = useState<CatalogSnippetState>({
    loading: false,
    description: null,
    error: null,
  });

  const fetchSnippet = useCallback(
    async (type: CatalogSnippetType, id: number) => {
      setState({ loading: true, description: null, error: null });

      try {
        const params = new URLSearchParams({ type, id: String(id) });
        const response = await fetch(
          `/api/characters/${characterId}/catalog-snippet?${params}`,
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? "Não foi possível carregar os detalhes.");
        }

        const body = (await response.json()) as { description?: string | null };
        setState({
          loading: false,
          description: body.description ?? null,
          error: null,
        });
      } catch (err) {
        setState({
          loading: false,
          description: null,
          error: err instanceof Error ? err.message : "Erro ao carregar detalhes.",
        });
      }
    },
    [characterId],
  );

  const reset = useCallback(() => {
    setState({ loading: false, description: null, error: null });
  }, []);

  return { ...state, fetchSnippet, reset };
}
