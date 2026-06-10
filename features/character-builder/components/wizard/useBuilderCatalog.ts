import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type CharacterBuilderData,
  type CharacterBuilderState,
  type CharacterBuilderSummary,
} from "@/features/character-builder/types/builder.types";
import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";
import {
  fetchCharacterBuilderDetails,
  fetchCharacterBuilderSummary,
  mergeBuilderCatalog,
} from "@/features/character-builder/services/builder.service";

function detailsKeyFor(state: CharacterBuilderState, level: number): string {
  return [
    state.class_id,
    state.species_id,
    state.background_id,
    level,
    state.subclass_id ?? 0,
  ].join(":");
}

export function useBuilderCatalog() {
  const [summary, setSummary] = useState<CharacterBuilderSummary | null>(null);
  const [summaryLevel, setSummaryLevel] = useState<number | null>(null);
  const [details, setDetails] = useState<Partial<CharacterBuilderData> | null>(null);
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const data = useMemo(
    () => (summary ? mergeBuilderCatalog(summary, details) : null),
    [summary, details],
  );

  useEffect(() => {
    fetchCharacterBuilderSummary(1)
      .then((loaded) => {
        setSummary(loaded);
        setSummaryLevel(1);
      })
      .catch(() => {
        /* prefetch opcional */
      });
  }, []);

  const refetchSummary = useCallback(async (level: number) => {
    const clamped = clampClassLevel(level);
    setLoadingCatalog(true);
    try {
      const loaded = await fetchCharacterBuilderSummary(clamped);
      setSummary(loaded);
      setSummaryLevel(clamped);
      setLoadError(null);
      return loaded;
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível carregar o catálogo.",
      );
      return null;
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setDetails(null);
    setDetailsKey(null);
  }, []);

  const ensureSummary = useCallback(
    async (level: number): Promise<CharacterBuilderSummary | null> => {
      const clamped = clampClassLevel(level);
      if (summary && summaryLevel === clamped) return summary;
      return refetchSummary(clamped);
    },
    [refetchSummary, summary, summaryLevel],
  );

  const ensureDetails = useCallback(
    async (state: CharacterBuilderState): Promise<boolean> => {
      if (!state.class_id || !state.species_id || !state.background_id) return false;

      const level = clampClassLevel(state.class_level);
      const key = detailsKeyFor(state, level);
      if (details?.details_loaded && detailsKey === key) return true;

      setLoadingDetails(true);
      try {
        const loaded = await fetchCharacterBuilderDetails({
          class_id: state.class_id,
          species_id: state.species_id,
          background_id: state.background_id,
          class_level: level,
          subclass_id: state.subclass_id,
        });
        setDetails(loaded);
        setDetailsKey(key);
        return true;
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Não foi possível carregar as escolhas.",
        );
        return false;
      } finally {
        setLoadingDetails(false);
      }
    },
    [details, detailsKey],
  );

  return {
    data,
    detailsKey,
    loadError,
    loadingCatalog,
    loadingDetails,
    clearDetails,
    ensureDetails,
    ensureSummary,
    refetchSummary,
  };
}
