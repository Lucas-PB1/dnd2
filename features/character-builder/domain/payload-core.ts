import { ApiError } from "@/lib/api/errors";
import { CHARACTER_NAME_MIN } from "@/shared/character";
import {
  applyBackgroundAsi,
  isBaseAbilitiesComplete,
} from "@/features/character-builder/domain/abilities/abilities";
import { validateShopPurchases } from "@/features/character-builder/domain/equipment/equipment-shop";
import { effectiveEquipmentModeForState } from "@/features/character-builder/domain/equipment/equipment-mode";
import { validateMulticlassSplit } from "@/features/character-builder/domain/multiclass/multiclass";
import { requiresSubclassSelection } from "@/features/character-builder/domain/progression/levels";
import type {
  AbilityKey,
  CharacterBuilderData,
  CharacterBuilderState,
  EquipmentMode,
} from "@/features/character-builder/types/builder.types";

export type PayloadCore = {
  cls: CharacterBuilderData["classes"][number];
  species: CharacterBuilderData["species"][number];
  background: CharacterBuilderData["backgrounds"][number];
  name: string;
  size: string;
  abilities: Record<AbilityKey, number>;
  equipmentMode: EquipmentMode;
};

export function resolvePayloadCore(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): PayloadCore {
  const cls = data.classes.find((entry) => entry.id === state.class_id);
  const species = data.species.find((entry) => entry.id === state.species_id);
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );

  if (!cls || !species || !background) {
    throw new ApiError("Seleções incompletas.", 400);
  }

  validateSubclass(cls, state);

  const multiclassError = validateMulticlassSplit(state, data.classes);
  if (multiclassError) throw new ApiError(multiclassError, 400);

  const shopError = validateShopPurchases(state);
  if (shopError) throw new ApiError(shopError, 400);

  const equipmentMode = effectiveEquipmentModeForState(state);
  if (equipmentMode === "campaign_shop" && state.shop_purchases.length === 0) {
    throw new ApiError(
      "Selecione itens na loja de campanha ou mude o modo de equipamento.",
      400,
    );
  }

  const name = state.name.trim();
  if (name.length < CHARACTER_NAME_MIN) {
    throw new ApiError(
      `O nome deve ter pelo menos ${CHARACTER_NAME_MIN} caracteres.`,
      400,
    );
  }

  const selectedRollSet =
    state.selected_roll_index !== null
      ? (state.roll_sets[state.selected_roll_index] ?? null)
      : null;

  if (
    !isBaseAbilitiesComplete(
      state.ability_method,
      state.ability_assignment,
      selectedRollSet,
    )
  ) {
    throw new ApiError("Atributos base incompletos ou inválidos.", 400);
  }

  const abilities = applyBackgroundAsi(
    state.ability_assignment,
    background.ability_options,
    state.background_asi,
  );

  if (equipmentMode !== "campaign_shop" && !state.equipment_option_key) {
    throw new ApiError("Escolha o equipamento inicial do antecedente.", 400);
  }

  return {
    cls,
    species,
    background,
    name,
    size: resolveSize(species.size_options, state.size),
    abilities,
    equipmentMode,
  };
}

function validateSubclass(
  cls: CharacterBuilderData["classes"][number],
  state: CharacterBuilderState,
) {
  if (requiresSubclassSelection(state.class_level, cls.subclasses)) {
    if (!state.subclass_id) {
      throw new ApiError("Escolha uma subclasse.", 400);
    }
    if (!cls.subclasses.some((sub) => sub.id === state.subclass_id)) {
      throw new ApiError("Subclasse inválida para esta classe.", 400);
    }
  } else if (state.subclass_id !== null) {
    throw new ApiError("Subclasse só é permitida a partir do nível 3.", 400);
  }
}

function resolveSize(sizeOptions: string, selectedSize: string | null): string {
  const sizes = sizeOptions.split(/\s+or\s+/i).map((size) => size.trim());
  const size = selectedSize ?? (sizes.length === 1 ? sizes[0] : null);
  if (!size) {
    throw new ApiError("Escolha o tamanho do personagem.", 400);
  }
  return size;
}
