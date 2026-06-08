import {
  FEAT_CHOICE_LEVELS,
  clampClassLevel,
} from "@/features/character-builder/domain/progression/levels";
import type {
  AbilityKey,
  BuilderProgressionFeat,
  CharacterBuilderData,
  CharacterBuilderState,
  ProgressionFeatChoiceKind,
  ProgressionFeatLevel,
  ProgressionFeatSlotChoice,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { toggleTraitOption } from "@/features/character-builder/domain/utils";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";

export const ASI_FEAT_NAME = "Ability Score Improvement";

export function progressionFeatLevelsForClass(
  classLevel: number,
): ProgressionFeatLevel[] {
  return FEAT_CHOICE_LEVELS.filter(
    (level) => level <= clampClassLevel(classLevel),
  ) as ProgressionFeatLevel[];
}

export function emptyProgressionFeatSlots(
  classLevel: number,
): ProgressionFeatSlotChoice[] {
  return progressionFeatLevelsForClass(classLevel).map((at_level) => ({
    at_level,
    kind: null,
    feat_id: null,
  }));
}

export function syncProgressionFeatSlots(
  state: CharacterBuilderState,
): ProgressionFeatSlotChoice[] {
  const required = progressionFeatLevelsForClass(state.class_level);
  const byLevel = new Map(
    state.progression_feat_slots.map((slot) => [slot.at_level, slot]),
  );

  return required.map((at_level) => {
    const existing = byLevel.get(at_level);
    return existing ?? { at_level, kind: null, feat_id: null };
  });
}

export function progressionSlotKey(atLevel: ProgressionFeatLevel): string {
  return `level_${atLevel}`;
}

export function parseMinLevelPrerequisite(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/level\s+(\d+)\+/i);
  return match ? Number(match[1]) : null;
}

export function parseAbilityPrerequisite(
  text: string | null,
): AbilityKey | null {
  if (!text) return null;
  for (const key of ABILITY_KEYS) {
    if (new RegExp(`\\b${key}\\s+\\d+`, "i").test(text)) {
      return key;
    }
  }
  return null;
}

export function parseAbilityPrerequisiteMin(
  text: string | null,
): number | null {
  if (!text) return null;
  const match = text.match(/\b(STR|DEX|CON|INT|WIS|CHA)\s+(\d+)/i);
  return match ? Number(match[2]) : null;
}

export function featEligibleAtLevel(
  feat: BuilderProgressionFeat,
  classLevel: number,
  abilities: Record<AbilityKey, number>,
): boolean {
  const minLevel = parseMinLevelPrerequisite(feat.prerequisite_text);
  if (minLevel !== null && classLevel < minLevel) {
    return false;
  }

  const abilityKey = parseAbilityPrerequisite(feat.prerequisite_text);
  const abilityMin = parseAbilityPrerequisiteMin(feat.prerequisite_text);
  if (abilityKey && abilityMin !== null && abilities[abilityKey] < abilityMin) {
    return false;
  }

  return true;
}

export function featsForProgressionSlot(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
  abilities: Record<AbilityKey, number>,
): BuilderProgressionFeat[] {
  const isEpicSlot = atLevel === 19;

  return data.progression_feats.filter((feat) => {
    if (feat.name === ASI_FEAT_NAME) return false;
  if (isEpicSlot) {
    return (
      (feat.category === "Epic Boon" || feat.category === "General") &&
      featEligibleAtLevel(feat, state.class_level, abilities)
    );
  }
    if (feat.category === "Epic Boon") return false;
    if (feat.category !== "General") return false;
    return featEligibleAtLevel(feat, state.class_level, abilities);
  });
}

export function asiFeat(data: CharacterBuilderData): BuilderProgressionFeat | undefined {
  return data.progression_feats.find((feat) => feat.name === ASI_FEAT_NAME);
}

export function setProgressionFeatSlot(
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
  kind: ProgressionFeatChoiceKind,
  featId: number | null,
): CharacterBuilderState {
  const slots = syncProgressionFeatSlots(state).map((slot) =>
    slot.at_level === atLevel ? { ...slot, kind, feat_id: featId } : slot,
  );

  const slotKey = progressionSlotKey(atLevel);
  const nextTraitOptions = state.progression_feat_trait_options.filter(
    (entry) => !entry.selection_key.startsWith(`${slotKey}:`),
  );
  const nextSpellSelections = state.feat_spell_selections.filter(
    (entry) =>
      entry.source !== "progression" ||
      !entry.selection_key.startsWith(`${slotKey}:`),
  );

  return {
    ...state,
    progression_feat_slots: slots,
    progression_feat_trait_options: nextTraitOptions,
    feat_spell_selections: nextSpellSelections,
  };
}

export function progressionTraitOptionsForSlot(
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
): TraitOptionSelection[] {
  const prefix = `${progressionSlotKey(atLevel)}:`;
  return state.progression_feat_trait_options.filter((entry) =>
    entry.selection_key.startsWith(prefix),
  );
}

export function toggleProgressionFeatTraitOption(
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  const slotPrefix = `${progressionSlotKey(atLevel)}:`;
  const enriched: TraitOptionSelection = {
    ...selection,
    selection_key: `${slotPrefix}${selection.selection_key}`,
  };

  const slotOptions = state.progression_feat_trait_options.filter((entry) =>
    entry.selection_key.startsWith(slotPrefix),
  );
  const otherOptions = state.progression_feat_trait_options.filter(
    (entry) => !entry.selection_key.startsWith(slotPrefix),
  );

  return {
    ...state,
    progression_feat_trait_options: [
      ...otherOptions,
      ...toggleTraitOption(slotOptions, enriched, max),
    ],
  };
}

export function validateProgressionFeatSelections(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  abilities: Record<AbilityKey, number>,
): string | null {
  const slots = syncProgressionFeatSlots(state);
  const asi = asiFeat(data);

  for (const slot of slots) {
    if (!slot.kind) {
      return `Escolha ASI ou feat no nível ${slot.at_level}.`;
    }

    if (slot.kind === "asi") {
      if (!asi) {
        return "Feat de ASI não encontrado no catálogo.";
      }
      for (const group of asi.origin_feat_choices) {
        const selected = progressionTraitOptionsForSlot(state, slot.at_level).filter(
          (entry) =>
            entry.trait_id === group.trait_id &&
            entry.option_group === group.option_group,
        );
        if (selected.length !== group.choice_count) {
          return `Complete o ASI do nível ${slot.at_level}: ${group.trait_name}.`;
        }
      }
      continue;
    }

    if (!slot.feat_id) {
      return `Escolha um feat no nível ${slot.at_level}.`;
    }

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!feat) {
      return `Feat inválido no nível ${slot.at_level}.`;
    }

    if (!featEligibleAtLevel(feat, state.class_level, abilities)) {
      return `Pré-requisitos não atendidos para ${feat.name} (nível ${slot.at_level}).`;
    }

    if (slot.at_level === 19 && slot.kind === "feat" && feat && feat.category !== "Epic Boon" && feat.category !== "General") {
      return `No nível 19, escolha um Epic Boon ou feat geral elegível.`;
    }

    for (const group of feat.origin_feat_choices) {
      const selected = progressionTraitOptionsForSlot(state, slot.at_level).filter(
        (entry) =>
          entry.trait_id === group.trait_id &&
          entry.option_group === group.option_group,
      );
      if (selected.length !== group.choice_count) {
        return `Complete as escolhas de ${feat.name} (nível ${slot.at_level}): ${group.trait_name}.`;
      }
    }
  }

  return null;
}

export function buildProgressionFeatsPayload(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): CreateCharacterBuilderPayloadFeats {
  const asi = asiFeat(data);
  const feats: CreateCharacterBuilderPayloadFeats = [];

  for (const slot of syncProgressionFeatSlots(state)) {
    const selectionKey = progressionSlotKey(slot.at_level);

    if (slot.kind === "asi" && asi) {
      feats.push({
        feat_id: asi.id,
        source_type: "class",
        source_id: state.class_id ?? 0,
        selection_key: selectionKey,
      });
      continue;
    }

    if (slot.kind === "feat" && slot.feat_id) {
      feats.push({
        feat_id: slot.feat_id,
        source_type: "class",
        source_id: state.class_id ?? 0,
        selection_key: selectionKey,
      });
    }
  }

  return feats;
}

type CreateCharacterBuilderPayloadFeats = {
  feat_id: number;
  source_type: string;
  source_id: number;
  selection_key?: string;
}[];
