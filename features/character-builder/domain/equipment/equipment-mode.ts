import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import {
  formatStartingGoldPreview,
  startingGoldGpForLevel,
} from "@/features/character-builder/domain/equipment/starting-gold";
import type {
  BuilderBackgroundEntry,
  CharacterBuilderState,
  EquipmentMode,
} from "@/features/character-builder/types/builder.types";

export function supportsEquipmentModeToggle(classLevel: number): boolean {
  return clampClassLevel(classLevel) >= 2;
}

export function isCampaignEquipmentMode(mode: EquipmentMode): boolean {
  return mode === "campaign_shop";
}

export function isSimplifiedEquipmentMode(mode: EquipmentMode): boolean {
  return mode === "background" || mode === "starting_gold";
}

export function effectiveEquipmentMode(
  classLevel: number,
  mode: EquipmentMode,
): EquipmentMode {
  return supportsEquipmentModeToggle(classLevel) ? mode : "background";
}

export function resolveStartingGoldGp(state: CharacterBuilderState): number {
  const mode = effectiveEquipmentMode(state.class_level, state.equipment_mode);
  if (mode !== "starting_gold" && mode !== "campaign_shop") {
    return 0;
  }
  return startingGoldGpForLevel(totalCharacterLevel(state), "average");
}

export function buildBackgroundInventory(
  background: BuilderBackgroundEntry,
  equipmentOptionKey: string | null,
): { item_id: number; quantity: number; is_equipped: boolean }[] {
  const equipment = background.equipment_options.find(
    (opt) => opt.option_key === equipmentOptionKey,
  );

  return (equipment?.items ?? [])
    .filter((item) => item.item_id !== null)
    .map((item) => ({
      item_id: item.item_id as number,
      quantity: item.quantity,
      is_equipped: false,
    }));
}

export function buildEquipmentInventory(
  background: BuilderBackgroundEntry,
  state: CharacterBuilderState,
): { item_id: number; quantity: number; is_equipped: boolean }[] {
  const mode = effectiveEquipmentMode(state.class_level, state.equipment_mode);

  if (mode === "starting_gold") {
    return [];
  }

  if (mode === "campaign_shop") {
    return state.shop_purchases.map((entry) => ({
      item_id: entry.item_id,
      quantity: entry.quantity,
      is_equipped: false,
    }));
  }

  return buildBackgroundInventory(background, state.equipment_option_key);
}

export function equipmentChoiceLabel(state: CharacterBuilderState): string | undefined {
  const mode = effectiveEquipmentMode(state.class_level, state.equipment_mode);
  if (mode === "starting_gold") {
    const gp = resolveStartingGoldGp(state);
    return gp > 0 ? `${gp.toLocaleString("pt-BR")} PO` : "Ouro PHB";
  }
  return state.equipment_option_key ?? undefined;
}

export function formatEquipmentModeSummary(state: CharacterBuilderState): string | null {
  const mode = effectiveEquipmentMode(state.class_level, state.equipment_mode);
  if (mode === "starting_gold") {
    const preview = formatStartingGoldPreview(totalCharacterLevel(state));
    const gp = resolveStartingGoldGp(state);
    if (gp > 0) {
      return preview ? `Ouro inicial: ${gp.toLocaleString("pt-BR")} PO (${preview})` : `${gp.toLocaleString("pt-BR")} PO`;
    }
    return "Ouro inicial PHB (sem bônus neste nível; sem pacote de equipamento)";
  }
  if (mode === "campaign_shop") {
    const gp = resolveStartingGoldGp(state);
    const spent = state.shop_purchases.reduce(
      (sum, entry) => sum + entry.unit_price_gp * entry.quantity,
      0,
    );
    return `Loja de campanha: ${spent.toLocaleString("pt-BR")} / ${gp.toLocaleString("pt-BR")} PO`;
  }
  return state.equipment_option_key
    ? `Pacote ${state.equipment_option_key} do antecedente`
    : null;
}
