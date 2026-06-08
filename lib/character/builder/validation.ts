import { isBaseAbilitiesComplete, parseSizeOptions } from "@/lib/character/abilities";
import { validateExpertiseSelections } from "@/lib/character/class-expertise";
import { validateSpellSelections } from "@/lib/character/class-spells";
import { validateFeatSpellSelections } from "@/lib/character/feat-spells";
import { mergeOriginFeatTraitOptions } from "@/lib/character/origin-feat";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character/types/builder.types";
import {
  selectedBackground,
  selectedClass,
  selectedSpecies,
} from "./selectors";
import { selectedRollSet } from "./state";

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
      if (!state.class_id) return "Escolha uma classe.";
      return null;
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
        if (state.class_tool_selections.length < group.choice_count) {
          return `Selecione ferramenta(s) de classe: ${group.option_group}.`;
        }
      }

      for (const opt of background.tool_proficiency_options) {
        if (!opt.tool_id && opt.tool_category) {
          if (state.background_tool_selections.length < opt.choice_count) {
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

      if (species.name === "Human" && !state.human_origin_feat_id) {
        return "Humanos escolhem um feat de origem (Versátil).";
      }

      const originFeatOptions = mergeOriginFeatTraitOptions(
        background,
        state.origin_feat_trait_options,
      );

      for (const group of background.origin_feat_choices) {
        const count = originFeatOptions.filter(
          (entry) =>
            entry.trait_id === group.trait_id &&
            entry.option_group === group.option_group,
        ).length;
        if (count !== group.choice_count) {
          return `Complete as escolhas do feat: ${group.trait_name}.`;
        }
      }

      if (!state.equipment_option_key) {
        return "Escolha o equipamento inicial do antecedente.";
      }

      const spellError = validateSpellSelections(cls.spellcasting, state);
      if (spellError) return spellError;

      const featSpellError = validateFeatSpellSelections(data, state);
      if (featSpellError) return featSpellError;

      if (state.human_origin_feat_id) {
        const humanFeat = data.origin_feats.find(
          (entry) => entry.id === state.human_origin_feat_id,
        );
        for (const group of humanFeat?.origin_feat_choices ?? []) {
          const count = state.human_origin_feat_trait_options.filter(
            (entry) =>
              entry.trait_id === group.trait_id &&
              entry.option_group === group.option_group,
          ).length;
          if (count !== group.choice_count) {
            return `Complete as escolhas do feat Versátil: ${group.trait_name}.`;
          }
        }
      }

      const expertiseError = validateExpertiseSelections(cls, data, state);
      if (expertiseError) return expertiseError;

      return null;
    }
    case 5: {
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
