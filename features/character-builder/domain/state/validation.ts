import { isBaseAbilitiesComplete, parseSizeOptions } from "@/features/character-builder/domain/abilities/abilities";
import { validateFeatStep } from "@/features/character-builder/domain/feats/feat-step";
import { validateExpertiseSelections } from "@/features/character-builder/domain/expertise/class-expertise";
import { validateOptionalFeatureSelections } from "@/features/character-builder/domain/optional-features";
import { requiresSubclassSelection } from "@/features/character-builder/domain/progression/levels";
import { validateSpellSelections } from "@/features/character-builder/domain/spells/class-spells";
import { validateFeatSpellSelections } from "@/features/character-builder/domain/spells/feat-spells";
import { validateMulticlassSplit } from "@/features/character-builder/domain/multiclass/multiclass";
import { validateShopPurchases } from "@/features/character-builder/domain/equipment/equipment-shop";
import { effectiveEquipmentModeForState } from "@/features/character-builder/domain/equipment/equipment-mode";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  selectedBackground,
  selectedClass,
  selectedSpecies,
} from "./selectors";
import { selectedRollSet } from "./state";

function requiredChoiceCountError(params: {
  selectedCount: number;
  choiceCount: number;
  isRequired?: boolean;
}): boolean {
  if (params.isRequired === false) {
    return params.selectedCount > 0 && params.selectedCount !== params.choiceCount;
  }
  return params.selectedCount !== params.choiceCount;
}

function toolSelectionCount(
  selections: { source_type: string; source_id: number; option_group?: string }[],
  params: { source_type: string; source_id: number; option_group: string },
): number {
  return selections.filter(
    (entry) =>
      entry.source_type === params.source_type &&
      entry.source_id === params.source_id &&
      (entry.option_group ?? params.option_group) === params.option_group,
  ).length;
}

export function validateBuilderStep(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
  step: number,
): string | null {
  switch (step) {
    case 0: {
      if (
        !isBaseAbilitiesComplete(
          state.ability_method,
          state.ability_assignment,
          selectedRollSet(state),
        )
      ) {
        if (state.ability_method === "standard") {
          return "Distribua o array padrão (15, 14, 13, 12, 10, 8) entre os atributos.";
        }
        if (state.ability_method === "point_buy") {
          return "Gaste exatamente 27 pontos (atributos entre 8 e 15).";
        }
        if (state.selected_roll_index === null) {
          return "Escolha um conjunto de rolagem válido (soma entre 72 e 80).";
        }
        return "Atribua os valores rolados entre os seis atributos.";
      }
      return null;
    }
    case 1: {
      if (!data) return "Carregando catálogo…";
      if (!state.species_id) return "Escolha uma espécie.";
      const species = selectedSpecies(data, state);
      const sizes = species ? parseSizeOptions(species.size_options) : [];
      if (sizes.length > 1 && !state.size) {
        return "Escolha o tamanho do personagem.";
      }
      return null;
    }
    case 2: {
      if (!data) return "Carregando catálogo…";
      if (!state.background_id) return "Escolha um antecedente.";
      const background = selectedBackground(data, state);
      if (!background) return "Antecedente inválido.";
      const { background_asi: asi } = state;
      if (background.ability_options.length > 0) {
        if (asi.mode === "split") {
          if (!asi.plus2 || !asi.plus1) {
            return "Escolha +2 e +1 nos atributos do antecedente.";
          }
          if (asi.plus2 === asi.plus1) {
            return "Os bônus +2 e +1 devem ser em atributos diferentes.";
          }
          if (
            !background.ability_options.includes(asi.plus2) ||
            !background.ability_options.includes(asi.plus1)
          ) {
            return "Bônus de antecedente inválidos.";
          }
        }
      }
      return null;
    }
    case 3: {
      if (!data) return "Carregando catálogo…";
      if (!Number.isInteger(state.class_level) || state.class_level < 1 || state.class_level > 20) {
        return "Escolha um nível entre 1 e 20.";
      }
      if (!state.class_id) return "Escolha uma classe.";
      const cls = selectedClass(data, state);
      if (cls && requiresSubclassSelection(state.class_level, cls.subclasses)) {
        if (!state.subclass_id) return "Escolha uma subclasse.";
        if (cls && !cls.subclasses.some((sub) => sub.id === state.subclass_id)) {
          return "Subclasse inválida para esta classe.";
        }
      }
      return validateMulticlassSplit(state, data.classes);
    }
    case 4: {
      if (!data) return "Carregando catálogo…";
      if (!data.details_loaded) return "Carregando escolhas…";
      const cls = selectedClass(data, state);
      const species = selectedSpecies(data, state);
      const background = selectedBackground(data, state);
      if (!cls || !species || !background) return "Seleções incompletas.";

      const requiredSkills = cls.skill_choices.reduce(
        (sum, group) => sum + group.choice_count,
        0,
      );
      if (state.class_skill_ids.length !== requiredSkills) {
        return `Selecione ${requiredSkills} perícia(s) de classe.`;
      }

      for (const group of cls.tool_choices) {
        const count = toolSelectionCount(state.class_tool_selections, {
          source_type: "class",
          source_id: cls.id,
          option_group: group.option_group,
        });
        if (count !== group.choice_count) {
          return `Selecione ferramenta(s) de classe: ${group.option_group}.`;
        }
      }

      for (const opt of background.tool_proficiency_options) {
        if (!opt.tool_id && opt.tool_category) {
          const count = toolSelectionCount(state.background_tool_selections, {
            source_type: "background",
            source_id: background.id,
            option_group: opt.option_group,
          });
          if (count !== opt.choice_count) {
            return "Selecione a ferramenta do antecedente.";
          }
        }
      }

      for (const trait of species.traits) {
        for (const group of trait.choice_groups) {
          if (!group.is_required) continue;
          const count = state.species_trait_options.filter(
            (entry) =>
              entry.trait_id === group.trait_id &&
              entry.option_group === group.option_group,
          ).length;
          if (count !== group.choice_count) {
            return `Complete: ${trait.name} — ${group.option_group}.`;
          }
        }
      }

      const equipmentMode = effectiveEquipmentModeForState(state);
      if (equipmentMode === "background" || equipmentMode === "starting_gold") {
        if (!state.equipment_option_key) {
          return "Escolha o equipamento inicial do antecedente.";
        }
      }

      if (equipmentMode === "campaign_shop") {
        if (state.shop_purchases.length === 0) {
          return "Selecione itens na loja de campanha.";
        }
        const shopError = validateShopPurchases(state);
        if (shopError) return shopError;
      }

      const spellError = validateSpellSelections(cls.spellcasting, state);
      if (spellError) return spellError;

      const featSpellError = validateFeatSpellSelections(data, state);
      if (featSpellError) return featSpellError;

      const expertiseError = validateExpertiseSelections(cls, data, state);
      if (expertiseError) return expertiseError;

      const optionalError = validateOptionalFeatureSelections(cls, state);
      if (optionalError) return optionalError;

      return null;
    }
    case 5: {
      if (!data) return "Carregando catálogo…";
      if (!data.details_loaded) return "Carregando talentos…";
      return validateFeatStep(data, state);
    }
    case 6: {
      if (state.name.trim().length < 2) {
        return "Informe o nome do personagem (mínimo 2 caracteres).";
      }
      return null;
    }
    default:
      return null;
  }
}

export function canAdvance(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
): boolean {
  return validateBuilderStep(data, state, state.step) === null;
}
