import type { CharacterInventoryItem } from "@/shared/character";
import {
  asBoolean,
  asNumber,
  asOptionalNumber,
  asString,
  isRecord,
} from "@/lib/character/map-sheet/guards";

export function mapInventoryItem(value: unknown): CharacterInventoryItem | null {
  if (!isRecord(value)) return null;

  return {
    item_id: asNumber(value.item_id),
    name: asString(value.name) ?? "Item",
    quantity: asNumber(value.quantity, 1),
    is_equipped: asBoolean(value.is_equipped),
    item_type: asString(value.item_type) ?? "Item",
    cost_gp: asOptionalNumber(value.cost_gp),
    weight_lb: asOptionalNumber(value.weight_lb),
    is_magical: asBoolean(value.is_magical),
    weapon_category: asString(value.weapon_category),
    damage_die: asString(value.damage_die),
    die_count: asOptionalNumber(value.die_count),
    flat_bonus: asOptionalNumber(value.flat_bonus),
    damage_type: asString(value.damage_type),
    mastery_name: asString(value.mastery_name),
    weapon_properties: asString(value.weapon_properties),
    armor_category: asString(value.armor_category),
    ac_bonus: asOptionalNumber(value.ac_bonus),
    min_strength: asOptionalNumber(value.min_strength),
    stealth_disadvantage:
      typeof value.stealth_disadvantage === "boolean"
        ? value.stealth_disadvantage
        : null,
    plus_dex_modifier:
      typeof value.plus_dex_modifier === "boolean" ? value.plus_dex_modifier : null,
    max_dex_bonus: asOptionalNumber(value.max_dex_bonus),
    is_attuned: asBoolean(value.is_attuned),
    requires_attunement: asBoolean(value.requires_attunement),
    is_consumable: asBoolean(value.is_consumable),
  };
}
