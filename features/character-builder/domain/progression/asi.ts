import {
  ASI_FEAT_NAME,
  asiFeat,
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import type {
  AbilityKey,
  BuilderOriginFeatChoice,
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";

const ABILITY_NAME_TO_KEY: Record<string, AbilityKey> = {
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

const MAX_ABILITY_SCORE = 20;

function abilityKeyFromOptionName(name: string): AbilityKey | null {
  return ABILITY_NAME_TO_KEY[name] ?? null;
}

function findTraitOptionName(
  groups: BuilderOriginFeatChoice[],
  selection: TraitOptionSelection,
): string | null {
  for (const group of groups) {
    if (
      group.trait_id !== selection.trait_id ||
      group.option_group !== selection.option_group
    ) {
      continue;
    }
    const option = group.options.find(
      (entry) => entry.trait_option_id === selection.trait_option_id,
    );
    if (option) return option.name;
  }
  return null;
}

function selectionForGroup(
  selections: TraitOptionSelection[],
  optionGroup: string,
): TraitOptionSelection | undefined {
  return selections.find((entry) => entry.option_group === optionGroup);
}

function bumpAbility(
  abilities: Record<AbilityKey, number>,
  key: AbilityKey,
  delta: number,
): Record<AbilityKey, number> {
  return {
    ...abilities,
    [key]: Math.min(MAX_ABILITY_SCORE, abilities[key] + delta),
  };
}

export function applyAsiTraitOptions(
  abilities: Record<AbilityKey, number>,
  selections: TraitOptionSelection[],
  groups: BuilderOriginFeatChoice[],
): Record<AbilityKey, number> {
  let result = { ...abilities };

  const primary = selectionForGroup(selections, "Primary Ability Score");
  const secondary = selectionForGroup(selections, "Secondary Ability Score");
  const tertiary = selectionForGroup(selections, "Tertiary Ability Score");

  if (primary && secondary && tertiary) {
    for (const groupName of [
      "Primary Ability Score",
      "Secondary Ability Score",
      "Tertiary Ability Score",
    ] as const) {
      const selection = selectionForGroup(selections, groupName);
      if (!selection) continue;
      const name = findTraitOptionName(groups, selection);
      const key = name ? abilityKeyFromOptionName(name) : null;
      if (key) result = bumpAbility(result, key, 1);
    }
    return result;
  }

  if (primary && secondary) {
    const primaryName = findTraitOptionName(groups, primary);
    const secondaryName = findTraitOptionName(groups, secondary);
    const primaryKey = primaryName
      ? abilityKeyFromOptionName(primaryName)
      : null;
    const secondaryKey = secondaryName
      ? abilityKeyFromOptionName(secondaryName)
      : null;
    if (primaryKey) result = bumpAbility(result, primaryKey, 2);
    if (secondaryKey) result = bumpAbility(result, secondaryKey, 1);
  }

  for (const selection of selections) {
    if (selection.option_group !== "Ability Score") continue;
    const name = findTraitOptionName(groups, selection);
    const key = name ? abilityKeyFromOptionName(name) : null;
    if (key) result = bumpAbility(result, key, 1);
  }

  return result;
}

export function applyProgressionAbilityDeltas(
  abilities: Record<AbilityKey, number>,
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): Record<AbilityKey, number> {
  const asi = asiFeat(data);
  let result = { ...abilities };

  for (const slot of syncProgressionFeatSlots(state)) {
    const selections = progressionTraitOptionsForSlot(state, slot.at_level);
    if (selections.length === 0) continue;

    if (slot.kind === "asi" && asi) {
      result = applyAsiTraitOptions(
        result,
        selections,
        asi.origin_feat_choices,
      );
      continue;
    }

    if (slot.kind === "feat" && slot.feat_id) {
      const feat = data.progression_feats.find(
        (entry) => entry.id === slot.feat_id,
      );
      if (feat) {
        result = applyAsiTraitOptions(
          result,
          selections,
          feat.origin_feat_choices,
        );
      }
    }
  }

  return result;
}

export function hasProgressionAbilitySelections(
  state: CharacterBuilderState,
): boolean {
  return state.progression_feat_trait_options.length > 0;
}

export function emptyAbilityScores(): Record<AbilityKey, number> {
  return ABILITY_KEYS.reduce(
    (acc, key) => {
      acc[key] = 10;
      return acc;
    },
    {} as Record<AbilityKey, number>,
  );
}

export { ASI_FEAT_NAME };
