import { isRecord, mapArray } from "@/lib/character/map-sheet/guards";
import { mapInventoryItem } from "@/lib/character/map-sheet/inventory";
import {
  mapActiveEffect,
  mapProficiency,
  mapStatModifier,
  mapTraitOption,
  mapTraitSpellChoice,
  mapTraitSummary,
} from "@/lib/character/map-sheet/sheet-features";
import { mapSheetSummary } from "@/lib/character/map-sheet/sheet-summary";
import type { SheetRpcData } from "@/lib/character/map-sheet/types";

export function emptySheetRpcData(): SheetRpcData {
  return {
    summary: null,
    inventory: [],
    traits: [],
    proficiencies: [],
    active_effects: [],
    stat_modifiers: [],
    trait_options: [],
    trait_spell_choices: [],
  };
}

export function mapSheetRpcResponse(data: unknown): SheetRpcData {
  if (!isRecord(data)) return emptySheetRpcData();

  return {
    summary: mapSheetSummary(data.summary),
    inventory: mapArray(data.inventory, mapInventoryItem),
    traits: mapArray(data.traits, mapTraitSummary),
    proficiencies: mapArray(data.proficiencies, mapProficiency),
    active_effects: mapArray(data.active_effects, mapActiveEffect),
    stat_modifiers: mapArray(data.stat_modifiers, mapStatModifier),
    trait_options: mapArray(data.trait_options, mapTraitOption),
    trait_spell_choices: mapArray(
      data.trait_spell_choices,
      mapTraitSpellChoice,
    ),
  };
}
