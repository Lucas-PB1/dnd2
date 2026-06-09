import type {
  CharacterAbilityKey,
  CharacterAbilityScore,
  CharacterActiveEffect,
  CharacterInventoryItem,
  CharacterSavingThrow,
  CharacterSheetSummary,
  CharacterSkillCheck,
  CharacterSpellcastingBlock,
  CharacterSpellSlot,
  CharacterStatModifier,
  CharacterTraitOptionSummary,
  CharacterTraitSpellChoice,
  CharacterWeaponAttack,
} from "@/features/character-sheet/types/character.types";

export type SkillCatalogRow = {
  name: string;
  base_attribute: string;
};

export type SheetRpcData = {
  summary: CharacterSheetSummary | null;
  inventory: CharacterInventoryItem[];
  active_effects: CharacterActiveEffect[];
  stat_modifiers: CharacterStatModifier[];
  trait_options: CharacterTraitOptionSummary[];
  trait_spell_choices: CharacterTraitSpellChoice[];
};

export type RollContextData = {
  abilities: CharacterAbilityScore[];
  saving_throws: CharacterSavingThrow[];
  skills: CharacterSkillCheck[];
  spellcasting_entries: CharacterSpellcastingBlock[];
  weapons: CharacterWeaponAttack[];
  spell_slots: CharacterSpellSlot[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asAbilityKey(value: unknown): CharacterAbilityKey | null {
  if (
    value === "STR" ||
    value === "DEX" ||
    value === "CON" ||
    value === "INT" ||
    value === "WIS" ||
    value === "CHA"
  ) {
    return value;
  }
  return null;
}

function abilityLabel(ability: CharacterAbilityKey): string {
  const labels: Record<CharacterAbilityKey, string> = {
    STR: "Força",
    DEX: "Destreza",
    CON: "Constituição",
    INT: "Inteligência",
    WIS: "Sabedoria",
    CHA: "Carisma",
  };
  return labels[ability];
}

export function emptySheetRpcData(): SheetRpcData {
  return {
    summary: null,
    inventory: [],
    active_effects: [],
    stat_modifiers: [],
    trait_options: [],
    trait_spell_choices: [],
  };
}

export function emptyRollContextData(): RollContextData {
  return {
    abilities: [],
    saving_throws: [],
    skills: [],
    spellcasting_entries: [],
    weapons: [],
    spell_slots: [],
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

export function mapSheetSummary(value: unknown): CharacterSheetSummary | null {
  if (!isRecord(value)) return null;

  return {
    size: asString(value.size),
    speed: asNumber(value.speed),
    current_hp: asNumber(value.current_hp),
    max_hp: asNumber(value.max_hp, 1),
    temporary_hp: asNumber(value.temporary_hp),
    death_save_successes: asNumber(value.death_save_successes),
    death_save_failures: asNumber(value.death_save_failures),
    heroic_inspiration: asBoolean(value.heroic_inspiration),
    armor_class: asNumber(value.armor_class, 10),
    feats: asString(value.feats),
    conditions: asString(value.conditions),
  };
}

export function mapInventoryItem(value: unknown): CharacterInventoryItem | null {
  if (!isRecord(value)) return null;

  return {
    item_id: asNumber(value.item_id),
    name: asString(value.name) ?? "Item",
    quantity: asNumber(value.quantity, 1),
    is_equipped: asBoolean(value.is_equipped),
    item_type: asString(value.item_type) ?? "Item",
    cost_gp: typeof value.cost_gp === "number" ? value.cost_gp : null,
    weight_lb: typeof value.weight_lb === "number" ? value.weight_lb : null,
    is_magical: asBoolean(value.is_magical),
    weapon_category: asString(value.weapon_category),
    damage_die: asString(value.damage_die),
    die_count: typeof value.die_count === "number" ? value.die_count : null,
    flat_bonus: typeof value.flat_bonus === "number" ? value.flat_bonus : null,
    damage_type: asString(value.damage_type),
    mastery_name: asString(value.mastery_name),
    weapon_properties: asString(value.weapon_properties),
    armor_category: asString(value.armor_category),
    ac_bonus: typeof value.ac_bonus === "number" ? value.ac_bonus : null,
    min_strength: typeof value.min_strength === "number" ? value.min_strength : null,
    stealth_disadvantage:
      typeof value.stealth_disadvantage === "boolean"
        ? value.stealth_disadvantage
        : null,
    plus_dex_modifier:
      typeof value.plus_dex_modifier === "boolean" ? value.plus_dex_modifier : null,
    max_dex_bonus:
      typeof value.max_dex_bonus === "number" ? value.max_dex_bonus : null,
    is_attuned: asBoolean(value.is_attuned),
    requires_attunement: asBoolean(value.requires_attunement),
    is_consumable: asBoolean(value.is_consumable),
  };
}

export function mapTraitOption(value: unknown): CharacterTraitOptionSummary | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asNumber(value.trait_id),
    trait_name: asString(value.trait_name) ?? "Traço",
    option_group: asString(value.option_group) ?? "default",
    choice_count: asNumber(value.choice_count, 1),
    is_required: asBoolean(value.is_required, true),
    selection_key: asString(value.selection_key) ?? "",
    trait_option_id: asNumber(value.trait_option_id),
    option_name: asString(value.option_name) ?? "Escolha",
    option_description: asString(value.option_description),
    option_skill_name: asString(value.option_skill_name),
    option_tool_name: asString(value.option_tool_name),
    option_spell_list_name: asString(value.option_spell_list_name),
    source_type: asString(value.source_type),
    source_id: typeof value.source_id === "number" ? value.source_id : null,
    notes: asString(value.notes),
  };
}

export function mapTraitSpellChoice(value: unknown): CharacterTraitSpellChoice | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asNumber(value.trait_id),
    trait_name: asString(value.trait_name) ?? "Traço",
    choice_group: asString(value.choice_group) ?? "spell",
    choice_count: asNumber(value.choice_count, 1),
    spell_level: typeof value.spell_level === "number" ? value.spell_level : null,
    always_prepared: asBoolean(value.always_prepared),
    free_casts_per: asString(value.free_casts_per),
    selection_key: asString(value.selection_key) ?? "",
    spell_id: asNumber(value.spell_id),
    spell_name: asString(value.spell_name) ?? "Magia",
    level: asNumber(value.level),
    school: asString(value.school),
    trait_option_name: asString(value.trait_option_name),
    spell_list_name: asString(value.spell_list_name),
    source_type: asString(value.source_type),
    source_id: typeof value.source_id === "number" ? value.source_id : null,
    notes: asString(value.notes),
  };
}

export function mapActiveEffect(value: unknown): CharacterActiveEffect | null {
  if (!isRecord(value)) return null;

  return {
    source_type: asString(value.source_type) ?? "effect",
    source_name: asString(value.source_name) ?? "Efeito",
    trait_name: asString(value.trait_name),
    effect_name: asString(value.effect_name) ?? "Efeito",
    is_active: asBoolean(value.is_active, true),
    duration_text: asString(value.duration_text),
    modifiers: asArray(value.modifiers),
    damage_adjustments: asArray(value.damage_adjustments),
    statuses: asArray(value.statuses),
    condition_adjustments: asArray(value.condition_adjustments),
    proficiencies: asArray(value.proficiencies),
  };
}

export function mapStatModifier(value: unknown): CharacterStatModifier | null {
  if (!isRecord(value)) return null;

  return {
    affected_stat: asString(value.affected_stat) ?? "stat",
    operation: asString(value.operation) ?? "add",
    modifier_value: asNumber(value.modifier_value),
    source_name: asString(value.source_name) ?? "Modificador",
    is_active: asBoolean(value.is_active, true),
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
    attack_bonus:
      typeof value.attack_bonus === "number" ? value.attack_bonus : null,
    damage_formula: asString(value.damage_formula),
    damage_type: asString(value.damage_type),
    properties: asString(value.properties),
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

export function mapSheetRpcResponse(data: unknown): SheetRpcData {
  if (!isRecord(data)) return emptySheetRpcData();

  return {
    summary: mapSheetSummary(data.summary),
    inventory: asArray(data.inventory).flatMap((entry) => {
      const item = mapInventoryItem(entry);
      return item ? [item] : [];
    }),
    active_effects: asArray(data.active_effects).flatMap((entry) => {
      const effect = mapActiveEffect(entry);
      return effect ? [effect] : [];
    }),
    stat_modifiers: asArray(data.stat_modifiers).flatMap((entry) => {
      const modifier = mapStatModifier(entry);
      return modifier ? [modifier] : [];
    }),
    trait_options: asArray(data.trait_options).flatMap((entry) => {
      const option = mapTraitOption(entry);
      return option ? [option] : [];
    }),
    trait_spell_choices: asArray(data.trait_spell_choices).flatMap((entry) => {
      const choice = mapTraitSpellChoice(entry);
      return choice ? [choice] : [];
    }),
  };
}

export function mapRollContextResponse(data: unknown): RollContextData {
  if (!isRecord(data)) return emptyRollContextData();

  return {
    abilities: mapAbilityScores(data.abilities),
    saving_throws: asArray(data.saving_throws).flatMap((entry) => {
      const save = mapSavingThrow(entry);
      return save ? [save] : [];
    }),
    skills: asArray(data.skills).flatMap((entry) => {
      const skill = mapSkill(entry);
      return skill ? [skill] : [];
    }),
    spellcasting_entries: asArray(data.spellcasting).flatMap((entry) => {
      const spellcasting = mapSpellcastingBlock(entry);
      return spellcasting ? [spellcasting] : [];
    }),
    weapons: asArray(data.weapons).flatMap((entry) => {
      const weapon = mapWeaponAttack(entry);
      return weapon ? [weapon] : [];
    }),
    spell_slots: asArray(data.spell_slots).flatMap((entry) => {
      const slot = mapSpellSlot(entry);
      return slot && slot.max_slots > 0 ? [slot] : [];
    }),
  };
}
