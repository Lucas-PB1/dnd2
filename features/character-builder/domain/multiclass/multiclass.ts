import { computeMaxHp } from "@/features/character-builder/domain/progression/hp";
import {
  MAX_CLASS_LEVEL,
  clampClassLevel,
  requiresSubclassSelection,
} from "@/features/character-builder/domain/progression/levels";
import type {
  BuilderClassEntry,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

export type BuilderMulticlassEntry = {
  class_id: number;
  class_level: number;
  subclass_id: number | null;
};

export function totalCharacterLevel(state: CharacterBuilderState): number {
  const secondary = state.secondary_class?.class_level ?? 0;
  return state.class_level + secondary;
}

export function clampedTotalCharacterLevel(state: CharacterBuilderState): number {
  return clampClassLevel(totalCharacterLevel(state));
}

export function validateMulticlassSplit(
  state: CharacterBuilderState,
  classes: BuilderClassEntry[],
): string | null {
  if (!state.secondary_class) return null;

  if (state.secondary_class.class_id === state.class_id) {
    return "A segunda classe deve ser diferente da principal.";
  }

  if (state.secondary_class.class_level < 1) {
    return "Nível da segunda classe inválido.";
  }

  if (totalCharacterLevel(state) > MAX_CLASS_LEVEL) {
    return `Nível total não pode exceder ${MAX_CLASS_LEVEL}.`;
  }

  const secondaryClass = classes.find(
    (entry) => entry.id === state.secondary_class?.class_id,
  );

  if (!secondaryClass) {
    return "Segunda classe inválida.";
  }

  if (
    requiresSubclassSelection(
      state.secondary_class.class_level,
      secondaryClass.subclasses,
    ) &&
    !state.secondary_class.subclass_id
  ) {
    return "Escolha a subclasse da segunda classe.";
  }

  return null;
}

export function buildClassesRpcPayload(
  state: CharacterBuilderState,
): {
  class_id: number;
  class_level: number;
  subclass_id: number | null;
}[] {
  if (!state.class_id) return [];

  const entries = [
    {
      class_id: state.class_id,
      class_level: state.class_level,
      subclass_id: state.subclass_id,
    },
  ];

  if (state.secondary_class) {
    entries.push({
      class_id: state.secondary_class.class_id,
      class_level: state.secondary_class.class_level,
      subclass_id: state.secondary_class.subclass_id,
    });
  }

  return entries;
}

/** Soma de PV por classe (aproximação PHB para criação simultânea). */
export function computeMulticlassMaxHp(
  state: CharacterBuilderState,
  classes: BuilderClassEntry[],
  constitutionModifier: number,
): number {
  const primary = classes.find((entry) => entry.id === state.class_id);
  if (!primary) return 1;

  let hp = computeMaxHp(primary.hit_die, constitutionModifier, state.class_level);

  if (state.secondary_class) {
    const secondary = classes.find(
      (entry) => entry.id === state.secondary_class?.class_id,
    );
    if (secondary) {
      hp += computeMaxHp(
        secondary.hit_die,
        constitutionModifier,
        state.secondary_class.class_level,
      );
    }
  }

  return hp;
}

export function maxSecondaryClassLevel(state: CharacterBuilderState): number {
  return Math.max(1, MAX_CLASS_LEVEL - clampClassLevel(state.class_level));
}
