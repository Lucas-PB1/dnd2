import {
  applyBackgroundAsi,
  isBaseAbilitiesComplete,
} from "@/features/character-builder/domain/abilities/abilities";
import { ABILITY_KEYS } from "@/features/character-builder/domain/utils";
import type {
  AbilityKey,
  BackgroundAsiSelection,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import { selectedBackground } from "./selectors";
import { selectedRollSet } from "./state";

export function assignAbilityScore(
  state: CharacterBuilderState,
  ability: AbilityKey,
  score: number | null,
): CharacterBuilderState {
  const next = { ...state, ability_assignment: { ...state.ability_assignment } };

  // Array padrão: cada valor é único — ao reutilizar um número, libera o atributo anterior.
  // Rolagem: duplicatas são válidas (ex.: dois 13 no mesmo conjunto).
  if (state.ability_method === "standard" && score !== null) {
    for (const key of ABILITY_KEYS) {
      if (key !== ability && next.ability_assignment[key] === score) {
        next.ability_assignment[key] = null;
      }
    }
  }

  next.ability_assignment[ability] = score;
  return next;
}

export function assignRolledSlot(
  state: CharacterBuilderState,
  ability: AbilityKey,
  slotIndex: number | null,
): CharacterBuilderState {
  const pool = selectedRollSet(state);
  if (!pool) return state;

  const next = {
    ...state,
    ability_assignment: { ...state.ability_assignment },
    roll_slot_assignment: { ...state.roll_slot_assignment },
  };

  if (slotIndex === null || next.roll_slot_assignment[ability] === slotIndex) {
    next.roll_slot_assignment[ability] = null;
    next.ability_assignment[ability] = null;
    return next;
  }

  if (slotIndex < 0 || slotIndex >= pool.length) return state;

  for (const key of ABILITY_KEYS) {
    if (key !== ability && next.roll_slot_assignment[key] === slotIndex) {
      next.roll_slot_assignment[key] = null;
      next.ability_assignment[key] = null;
    }
  }

  next.roll_slot_assignment[ability] = slotIndex;
  next.ability_assignment[ability] = pool[slotIndex];
  return next;
}

export function computePreviewAbilities(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
): Record<AbilityKey, number> | null {
  const background = data ? selectedBackground(data, state) : null;
  if (
    !background ||
    !isBaseAbilitiesComplete(
      state.ability_method,
      state.ability_assignment,
      selectedRollSet(state),
    )
  ) {
    return null;
  }

  return applyBackgroundAsi(
    state.ability_assignment,
    background.ability_options,
    state.background_asi,
  );
}

export function updateBackgroundAsi(
  state: CharacterBuilderState,
  patch: Partial<BackgroundAsiSelection>,
): CharacterBuilderState {
  return {
    ...state,
    background_asi: { ...state.background_asi, ...patch },
  };
}
