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

const PREREQUISITE_ABILITY_NAMES: Record<string, AbilityKey> = {
  STR: "STR",
  DEX: "DEX",
  CON: "CON",
  INT: "INT",
  WIS: "WIS",
  CHA: "CHA",
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA",
};

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
  const match = text.match(/level\s+(\d+)\+?/i);
  return match ? Number(match[1]) : null;
}

export function parseAbilityPrerequisite(
  text: string | null,
): AbilityKey | null {
  return parseAbilityPrerequisites(text)[0]?.ability ?? null;
}

export function parseAbilityPrerequisiteMin(
  text: string | null,
): number | null {
  return parseAbilityPrerequisites(text)[0]?.minimum ?? null;
}

export function parseAbilityPrerequisites(
  text: string | null,
): { ability: AbilityKey; minimum: number }[] {
  if (!text) return [];

  const names = [
    ...ABILITY_KEYS,
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
  ].join("|");
  const matches = text.matchAll(new RegExp(`\\b(${names})\\s+(\\d+)\\+?`, "gi"));
  const parsed: { ability: AbilityKey; minimum: number }[] = [];

  for (const match of matches) {
    const raw = match[1];
    const ability = Object.entries(PREREQUISITE_ABILITY_NAMES).find(
      ([name]) => name.toLowerCase() === raw.toLowerCase(),
    )?.[1];
    const minimum = Number(match[2]);
    if (ability && Number.isFinite(minimum)) {
      parsed.push({ ability, minimum });
    }
  }

  return parsed;
}

export function featEligibleAtLevel(
  feat: BuilderProgressionFeat,
  slotLevel: number,
  abilities: Record<AbilityKey, number>,
): boolean {
  const minLevel = parseMinLevelPrerequisite(feat.prerequisite_text);
  if (minLevel !== null && slotLevel < minLevel) {
    return false;
  }

  const abilityPrerequisites = parseAbilityPrerequisites(feat.prerequisite_text);
  if (
    abilityPrerequisites.length > 0 &&
    !abilityPrerequisites.some(
      ({ ability, minimum }) => abilities[ability] >= minimum,
    )
  ) {
    return false;
  }

  return true;
}

function selectedFeatIdsInOtherSlots(
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
): Set<number> {
  return new Set(
    syncProgressionFeatSlots(state)
      .filter(
        (slot) =>
          slot.at_level !== atLevel &&
          slot.kind === "feat" &&
          slot.feat_id !== null,
      )
      .map((slot) => slot.feat_id as number),
  );
}

function choiceGroupIsRequired(group: { is_required?: boolean }): boolean {
  return group.is_required !== false;
}

function validateProgressionChoiceGroups(
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
  featName: string,
  groups: BuilderProgressionFeat["origin_feat_choices"],
): string | null {
  for (const group of groups) {
    const selected = progressionTraitOptionsForSlot(state, atLevel).filter(
      (entry) =>
        entry.trait_id === group.trait_id &&
        entry.option_group === group.option_group,
    );

    if (choiceGroupIsRequired(group)) {
      if (selected.length !== group.choice_count) {
        return `Complete as escolhas de ${featName} (nível ${atLevel}): ${group.trait_name}.`;
      }
      continue;
    }

    if (selected.length > 0 && selected.length !== group.choice_count) {
      return `Complete as escolhas opcionais de ${featName} (nível ${atLevel}): ${group.trait_name}.`;
    }
  }

  return null;
}

export function featsForProgressionSlot(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  atLevel: ProgressionFeatLevel,
  abilities: Record<AbilityKey, number>,
): BuilderProgressionFeat[] {
  const isEpicSlot = atLevel === 19;
  const selectedElsewhere = selectedFeatIdsInOtherSlots(state, atLevel);

  return data.progression_feats.filter((feat) => {
    if (feat.name === ASI_FEAT_NAME) return false;
    if (!feat.is_repeatable && selectedElsewhere.has(feat.id)) return false;
    if (isEpicSlot) {
      return (
        (feat.category === "Epic Boon" || feat.category === "General") &&
        featEligibleAtLevel(feat, atLevel, abilities)
      );
    }
    if (feat.category === "Epic Boon") return false;
    if (feat.category !== "General") return false;
    return featEligibleAtLevel(feat, atLevel, abilities);
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
      const asiError = validateProgressionChoiceGroups(
        state,
        slot.at_level,
        ASI_FEAT_NAME,
        asi.origin_feat_choices,
      );
      if (asiError) return asiError.replace("Ability Score Improvement", "ASI");
      continue;
    }

    if (!slot.feat_id) {
      return `Escolha um feat no nível ${slot.at_level}.`;
    }

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!feat) {
      return `Feat inválido no nível ${slot.at_level}.`;
    }

    if (!featEligibleAtLevel(feat, slot.at_level, abilities)) {
      return `Pré-requisitos não atendidos para ${feat.name} (nível ${slot.at_level}).`;
    }

    if (!feat.is_repeatable) {
      const repeated = syncProgressionFeatSlots(state).filter(
        (entry) => entry.kind === "feat" && entry.feat_id === feat.id,
      );
      if (repeated.length > 1) {
        return `${feat.name} não pode ser escolhido mais de uma vez.`;
      }
    }

    if (slot.at_level === 19 && slot.kind === "feat" && feat && feat.category !== "Epic Boon" && feat.category !== "General") {
      return `No nível 19, escolha um Epic Boon ou feat geral elegível.`;
    }

    if (slot.at_level !== 19 && feat.category !== "General") {
      return `No nível ${slot.at_level}, escolha um feat geral elegível.`;
    }

    const groupError = validateProgressionChoiceGroups(
      state,
      slot.at_level,
      feat.name,
      feat.origin_feat_choices,
    );
    if (groupError) return groupError;
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
