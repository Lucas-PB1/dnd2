import type {
  CharacterKnownSpell,
  CharacterTraitSpellChoice,
} from "@/shared/character";

export type SpellModalState =
  | { type: "known"; spell: CharacterKnownSpell }
  | { type: "trait"; spell: CharacterTraitSpellChoice }
  | null;
