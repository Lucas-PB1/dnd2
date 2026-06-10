import type { CharacterSheetSummary } from "@/shared/character";
import {
  asBoolean,
  asNumber,
  asString,
  isRecord,
} from "@/lib/character/map-sheet/guards";

export function mapSheetSummary(value: unknown): CharacterSheetSummary | null {
  if (!isRecord(value)) return null;

  return {
    size: asString(value.size),
    speed: asNumber(value.speed),
    current_hp: asNumber(value.current_hp),
    max_hp: asNumber(value.max_hp, 1),
    effective_max_hp: asNumber(
      value.effective_max_hp,
      asNumber(value.max_hp, 1),
    ),
    temporary_hp: asNumber(value.temporary_hp),
    death_save_successes: asNumber(value.death_save_successes),
    death_save_failures: asNumber(value.death_save_failures),
    heroic_inspiration: asBoolean(value.heroic_inspiration),
    armor_class: asNumber(value.armor_class, 10),
    effective_armor_class: asNumber(
      value.effective_armor_class,
      asNumber(value.armor_class, 10),
    ),
    effective_speed: asNumber(value.effective_speed, asNumber(value.speed)),
    feats: asString(value.feats),
    conditions: asString(value.conditions),
  };
}
