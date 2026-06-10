import { ApiError } from "@/lib/api/errors";
import {
  buildSkillsPayloadWithExpertise,
  validateExpertiseSelections,
} from "@/features/character-builder/domain/expertise/class-expertise";
import { validateOptionalFeatureSelections } from "@/features/character-builder/domain/optional-features";
import { validateProgressionFeatSelections } from "@/features/character-builder/domain/progression/feats";
import {
  classRequiresSpellSelection,
  validateSpellSelections,
} from "@/features/character-builder/domain/spells/class-spells";
import { validateFeatSpellSelections } from "@/features/character-builder/domain/spells/feat-spells";
import type {
  AbilityKey,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

export function validatePayloadChoices(
  cls: CharacterBuilderData["classes"][number],
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  abilities: Record<AbilityKey, number>,
) {
  const requiredClassSkills = cls.skill_choices.reduce(
    (sum, group) => sum + group.choice_count,
    0,
  );
  if (state.class_skill_ids.length !== requiredClassSkills) {
    throw new ApiError("Selecione todas as perícias de classe.", 400);
  }

  const expertiseError = validateExpertiseSelections(cls, data, state);
  if (expertiseError) throw new ApiError(expertiseError, 400);

  const optionalError = validateOptionalFeatureSelections(cls, state);
  if (optionalError) throw new ApiError(optionalError, 400);

  const progressionError = validateProgressionFeatSelections(data, state, abilities);
  if (progressionError) throw new ApiError(progressionError, 400);

  const spellError = validateSpellSelections(cls.spellcasting, state);
  if (spellError) throw new ApiError(spellError, 400);

  const featSpellError = validateFeatSpellSelections(data, state);
  if (featSpellError) throw new ApiError(featSpellError, 400);

  return {
    skillsPayload: buildSkillsPayloadWithExpertise(data, state),
    spellsRequired: classRequiresSpellSelection(cls.spellcasting),
  };
}
