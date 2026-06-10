import type {
  CharacterAbilityScore,
  CharacterSavingThrow,
  CharacterSkillCheck,
  CharacterSpellcastingBlock,
  CharacterSpellSlot,
  CharacterWeaponAttack,
} from "@/shared/character";
import {
  abilityLabel,
  asAbilityKey,
  asArray,
  asBoolean,
  asNumber,
  asString,
  isRecord,
  mapArray,
} from "@/lib/character/map-sheet/guards";
import { mapResource } from "@/lib/character/map-sheet/sheet-features";
import type { RollContextData, SkillCatalogRow } from "@/lib/character/map-sheet/types";

export function emptyRollContextData(): RollContextData {
  return {
    abilities: [],
    saving_throws: [],
    skills: [],
    spellcasting_entries: [],
    weapons: [],
    spell_slots: [],
    resources: [],
  };
}

export function mapSpellSlot(value: unknown): CharacterSpellSlot | null {
  if (!isRecord(value)) return null;

  return {
    slot_level: asNumber(value.slot_level),
    max_slots: asNumber(value.max_slots),
    used_slots: asNumber(value.used_slots),
  };
}

export function mapAbilityScores(value: unknown): CharacterAbilityScore[] {
  if (!isRecord(value)) return [];

  return (["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).flatMap(
    (ability) => {
      const entry = value[ability];
      if (!isRecord(entry)) return [];
      return [{
        ability,
        label: abilityLabel(ability),
        score: asNumber(entry.score),
        modifier: asNumber(entry.modifier),
      }];
    },
  );
}

export function mapSavingThrow(value: unknown): CharacterSavingThrow | null {
  if (!isRecord(value)) return null;
  const ability = asAbilityKey(value.ability);
  if (!ability) return null;

  return {
    ability,
    label: abilityLabel(ability),
    modifier: asNumber(value.modifier),
    proficient: asBoolean(value.proficient),
  };
}

export function mapSkill(value: unknown): CharacterSkillCheck | null {
  if (!isRecord(value)) return null;
  const baseAttribute = asAbilityKey(value.base_attribute);
  if (!baseAttribute) return null;

  return {
    skill: asString(value.skill) ?? "Skill",
    base_attribute: baseAttribute,
    modifier: asNumber(value.modifier),
    proficient: asBoolean(value.proficient),
    expertise: asBoolean(value.expertise),
  };
}

export function mapSpellcastingBlock(value: unknown): CharacterSpellcastingBlock | null {
  if (!isRecord(value)) return null;

  return {
    class_id: asNumber(value.class_id),
    class_name: asString(value.class_name) ?? "Classe",
    class_level: asNumber(value.class_level),
    spellcasting_ability: asAbilityKey(value.spellcasting_ability),
    prepared_count:
      typeof value.prepared_count === "number" ? value.prepared_count : null,
    spell_attack_bonus:
      typeof value.spell_attack_bonus === "number" ? value.spell_attack_bonus : null,
    spell_save_dc:
      typeof value.spell_save_dc === "number" ? value.spell_save_dc : null,
  };
}

export function mapWeaponAttack(value: unknown): CharacterWeaponAttack | null {
  if (!isRecord(value)) return null;

  return {
    item_id: asNumber(value.item_id),
    name: asString(value.name) ?? "Arma",
    is_equipped: asBoolean(value.is_equipped),
    attack_ability: asAbilityKey(value.attack_ability),
    attack_ability_options: asArray(value.attack_ability_options).flatMap(
      (entry) => {
        const ability = asAbilityKey(entry);
        return ability ? [ability] : [];
      },
    ),
    proficient: asBoolean(value.proficient),
    attack_bonus:
      typeof value.attack_bonus === "number" ? value.attack_bonus : null,
    damage_formula: asString(value.damage_formula),
    damage_type: asString(value.damage_type),
    properties: asString(value.properties),
    mastery_name: asString(value.mastery_name),
  };
}

export function mergeSkillCatalog(
  catalog: SkillCatalogRow[],
  rollSkills: CharacterSkillCheck[],
  abilities: CharacterAbilityScore[],
): CharacterSkillCheck[] {
  if (!abilities.length) return rollSkills;

  const rollByName = new Map(
    rollSkills.map((entry) => [entry.skill.toLowerCase(), entry]),
  );
  const abilityModifiers = new Map(
    abilities.map((entry) => [entry.ability, entry.modifier]),
  );

  const merged = catalog.flatMap((skill): CharacterSkillCheck[] => {
    const baseAttribute = asAbilityKey(skill.base_attribute);
    if (!baseAttribute) return [];
    const selected = rollByName.get(skill.name.toLowerCase());
    if (selected) return [selected];
    return [{
      skill: skill.name,
      base_attribute: baseAttribute,
      modifier: abilityModifiers.get(baseAttribute) ?? 0,
      proficient: false,
      expertise: false,
    }];
  });

  for (const entry of rollSkills) {
    if (!merged.some((skill) => skill.skill === entry.skill)) {
      merged.push(entry);
    }
  }

  return merged;
}

export function mapRollContextResponse(data: unknown): RollContextData {
  if (!isRecord(data)) return emptyRollContextData();

  return {
    abilities: mapAbilityScores(data.abilities),
    saving_throws: mapArray(data.saving_throws, mapSavingThrow),
    skills: mapArray(data.skills, mapSkill),
    spellcasting_entries: mapArray(data.spellcasting, mapSpellcastingBlock),
    weapons: mapArray(data.weapons, mapWeaponAttack),
    spell_slots: mapArray(data.spell_slots, (entry) => {
      const slot = mapSpellSlot(entry);
      return slot && slot.max_slots > 0 ? slot : null;
    }),
    resources: mapArray(data.resources, mapResource),
  };
}
