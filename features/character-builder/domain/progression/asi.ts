import {
  ASI_FEAT_NAME,
  asiFeat,
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import type {
  AbilityKey,
  BuilderOriginFeatChoice,
  BuilderTraitOption,
  BuilderTraitOptionModifier,
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

function abilityKeyFromAffectedStat(stat: string | null | undefined): AbilityKey | null {
  switch (stat?.toLowerCase()) {
    case "strength":
    case "str":
      return "STR";
    case "dexterity":
    case "dex":
      return "DEX";
    case "constitution":
    case "con":
      return "CON";
    case "intelligence":
    case "int":
      return "INT";
    case "wisdom":
    case "wis":
      return "WIS";
    case "charisma":
    case "cha":
      return "CHA";
    default:
      return null;
  }
}

function findTraitOption(
  groups: BuilderOriginFeatChoice[],
  selection: TraitOptionSelection,
): BuilderTraitOption | null {
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
    if (option) return option;
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
  maxValue = MAX_ABILITY_SCORE,
): Record<AbilityKey, number> {
  return {
    ...abilities,
    [key]: Math.min(maxValue, abilities[key] + delta),
  };
}

function modifierForSelection(
  groups: BuilderOriginFeatChoice[],
  selection: TraitOptionSelection,
  choiceModeKey?: string,
): BuilderTraitOptionModifier | null {
  const option = findTraitOption(groups, selection);
  if (!option?.modifiers?.length) return null;

  const ability = abilityKeyFromOptionName(option.name);
  const matchingAbility = option.modifiers.filter((modifier) => {
    const modifierAbility = abilityKeyFromAffectedStat(modifier.affected_stat);
    return !ability || !modifierAbility || modifierAbility === ability;
  });

  if (choiceModeKey) {
    return (
      matchingAbility.find(
        (modifier) => modifier.choice_mode_key === choiceModeKey,
      ) ?? null
    );
  }

  return (
    matchingAbility.find((modifier) => modifier.choice_mode_key === null) ??
    matchingAbility[0] ??
    null
  );
}

function applySelectionModifier(
  abilities: Record<AbilityKey, number>,
  groups: BuilderOriginFeatChoice[],
  selection: TraitOptionSelection,
  fallbackDelta: number,
  fallbackMax: number,
  choiceModeKey?: string,
): Record<AbilityKey, number> {
  const option = findTraitOption(groups, selection);
  const modifier = modifierForSelection(groups, selection, choiceModeKey);
  const key =
    abilityKeyFromAffectedStat(modifier?.affected_stat) ??
    (option ? abilityKeyFromOptionName(option.name) : null);

  if (!key) return abilities;

  const delta =
    modifier?.operation === "add" || !modifier
      ? (modifier?.modifier_value ?? fallbackDelta)
      : fallbackDelta;
  const maxValue = modifier?.max_value ?? fallbackMax;

  return bumpAbility(abilities, key, delta, maxValue);
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
      result = applySelectionModifier(
        result,
        groups,
        selection,
        1,
        MAX_ABILITY_SCORE,
        "triple_plus_one",
      );
    }
    return result;
  }

  if (primary && secondary) {
    result = applySelectionModifier(
      result,
      groups,
      primary,
      2,
      MAX_ABILITY_SCORE,
      "plus_two_plus_one",
    );
    result = applySelectionModifier(
      result,
      groups,
      secondary,
      1,
      MAX_ABILITY_SCORE,
      "plus_two_plus_one",
    );
  }

  for (const selection of selections) {
    if (selection.option_group !== "Ability Score") continue;
    result = applySelectionModifier(
      result,
      groups,
      selection,
      1,
      MAX_ABILITY_SCORE,
    );
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
