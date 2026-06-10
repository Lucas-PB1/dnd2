import { sortSpells } from "@/features/character-sheet/domain/sheet-display";
import type {
  CharacterKnownSpell,
  CharacterSpellcastingBlock,
  CharacterTraitSpellChoice,
} from "@/shared/character";

export type SpellGroupKey =
  | "cantrips"
  | "prepared"
  | "spellbook"
  | "always_prepared"
  | "trait_spells";

export type SpellGroup = {
  key: SpellGroupKey;
  label: string;
  spells: CharacterKnownSpell[];
};

export type TraitSpellGroup = {
  key: "trait_spells";
  label: string;
  spells: CharacterTraitSpellChoice[];
};

const GROUP_LABELS: Record<SpellGroupKey, string> = {
  cantrips: "Truques",
  prepared: "Preparadas",
  spellbook: "Grimório",
  always_prepared: "Sempre preparadas",
  trait_spells: "Magias de traços",
};

export function groupKnownSpells(
  spells: CharacterKnownSpell[],
): SpellGroup[] {
  const sorted = sortSpells(spells);
  const groups: SpellGroup[] = [];

  const cantrips = sorted.filter((spell) => spell.level === 0);
  if (cantrips.length > 0) {
    groups.push({ key: "cantrips", label: GROUP_LABELS.cantrips, spells: cantrips });
  }

  const alwaysPrepared = sorted.filter(
    (spell) => spell.always_prepared && spell.level > 0,
  );
  if (alwaysPrepared.length > 0) {
    groups.push({
      key: "always_prepared",
      label: GROUP_LABELS.always_prepared,
      spells: alwaysPrepared,
    });
  }

  const prepared = sorted.filter(
    (spell) =>
      spell.is_prepared &&
      !spell.always_prepared &&
      spell.level > 0,
  );
  if (prepared.length > 0) {
    groups.push({ key: "prepared", label: GROUP_LABELS.prepared, spells: prepared });
  }

  const spellbook = sorted.filter(
    (spell) =>
      !spell.is_prepared &&
      !spell.always_prepared &&
      spell.level > 0,
  );
  if (spellbook.length > 0) {
    groups.push({ key: "spellbook", label: GROUP_LABELS.spellbook, spells: spellbook });
  }

  return groups;
}

export function groupTraitSpells(
  choices: CharacterTraitSpellChoice[],
): TraitSpellGroup | null {
  if (choices.length === 0) return null;

  const sorted = [...choices].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.spell_name.localeCompare(b.spell_name, "pt-BR");
  });

  return {
    key: "trait_spells",
    label: GROUP_LABELS.trait_spells,
    spells: sorted,
  };
}

export function preparedSpellSummary(
  spells: CharacterKnownSpell[],
  spellcastingEntries: CharacterSpellcastingBlock[],
): string | null {
  const preparedCount = spells.filter(
    (spell) =>
      spell.is_prepared &&
      !spell.always_prepared &&
      spell.level > 0,
  ).length;

  if (preparedCount === 0) return null;

  const primary = spellcastingEntries[0];
  if (!primary) return `${preparedCount} preparadas`;

  const max = primary.prepared_count;
  return max == null
    ? `${preparedCount} preparadas`
    : `${preparedCount}/${max} preparadas`;
}
