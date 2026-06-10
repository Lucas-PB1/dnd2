import { useMemo } from "react";
import type {
  BuilderSpeciesEntry,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  hasOriginFeatContent,
  hasProgressionFeatContent,
} from "@/features/character-builder/domain/feats/feat-step";
import {
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";

export type FeatTab = "origin" | "progression";

export type FeatTabItem = {
  id: FeatTab;
  label: string;
  badge?: string;
};

type UseFeatTabsInput = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  species: BuilderSpeciesEntry | null | undefined;
};

export function useFeatTabs({
  data,
  state,
  species,
}: UseFeatTabsInput): FeatTabItem[] {
  return useMemo(() => {
    const items: FeatTabItem[] = [];

    if (hasOriginFeatContent(data, state)) {
      items.push({
        id: "origin",
        label: "Origem",
        badge: species?.name === "Human" && !state.human_origin_feat_id
          ? "Pendente"
          : undefined,
      });
    }

    if (hasProgressionFeatContent(state)) {
      const slots = syncProgressionFeatSlots(state);
      const filled = slots.filter((slot) => slot.kind).length;
      items.push({
        id: "progression",
        label: "Progressão",
        badge: `${filled}/${slots.length}`,
      });
    }

    return items;
  }, [data, state, species?.name]);
}
