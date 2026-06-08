import { useMemo } from "react";
import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderOriginFeat,
  BuilderProgressionFeat,
  BuilderSpeciesEntry,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  classRequiresExpertiseSelection,
  classRequiresSpellSelection,
  getExpertiseSelectionsForTrait,
  totalExpertiseChoicesRequired,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  featRequiresSpellSelection,
  totalFeatSpellChoicesRequired,
  totalProgressionFeatSpellChoicesRequired,
} from "@/features/character-builder/domain/spells/feat-spells";
import {
  findLockedOriginFeatSelection,
  getVisibleOriginFeatChoices,
} from "@/features/character-builder/domain/origin-feat";
import {
  classRequiresOptionalFeatureSelection,
  selectionsForOptionalGroup,
  totalOptionalFeatureChoicesRequired,
} from "@/features/character-builder/domain/optional-features";
import {
  progressionFeatLevelsForClass,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import type { ChoiceTabItem } from "./types";

type UseChoiceTabsInput = {
  cls: BuilderClassEntry | undefined;
  species: BuilderSpeciesEntry | undefined;
  background: BuilderBackgroundEntry | undefined;
  humanFeat: BuilderOriginFeat | undefined;
  progressionFeats: BuilderProgressionFeat[];
  state: CharacterBuilderState;
};

export function useChoiceTabs({
  cls,
  species,
  background,
  humanFeat,
  progressionFeats,
  state,
}: UseChoiceTabsInput): ChoiceTabItem[] {
  return useMemo(() => {
    if (!cls || !species || !background) return [];

    const maxSkills = cls.skill_choices.reduce((s, g) => s + g.choice_count, 0);
    const traitGroups = species.traits.flatMap((trait) =>
      trait.choice_groups
        .filter((g) => g.is_required)
        .map((group) => ({ trait, group })),
    );
    const lockedOriginFeat = findLockedOriginFeatSelection(background);
    const visibleOriginFeatChoices = getVisibleOriginFeatChoices(background);
    const hasFeats =
      species.name === "Human" ||
      lockedOriginFeat !== null ||
      visibleOriginFeatChoices.length > 0 ||
      progressionFeatLevelsForClass(state.class_level).length > 0;
    const optionalGroups = cls.optional_feature_groups ?? [];
    const hasOptional = classRequiresOptionalFeatureSelection(optionalGroups);
    const optionalRequired = totalOptionalFeatureChoicesRequired(optionalGroups);
    const optionalSelected = optionalGroups.reduce(
      (sum, group) => sum + selectionsForOptionalGroup(state, group).length,
      0,
    );
    const hasGear = background.equipment_options.length > 0;
    const spellcasting = cls.spellcasting;
    const hasClassSpells = classRequiresSpellSelection(spellcasting);
    const hasBackgroundFeatSpells = featRequiresSpellSelection(
      background.origin_feat_spellcasting,
    );
    const hasHumanFeatSpells = featRequiresSpellSelection(humanFeat?.spellcasting);
    const progressionFeatSpellRequired = totalProgressionFeatSpellChoicesRequired(
      progressionFeats,
      state,
    );
    const hasProgressionFeatSpells = progressionFeatSpellRequired > 0;
    const hasSpells =
      hasClassSpells ||
      hasBackgroundFeatSpells ||
      hasHumanFeatSpells ||
      hasProgressionFeatSpells;

    const items: ChoiceTabItem[] = [];

    const expertiseGroups = cls.expertise_choices ?? [];
    const hasExpertise = classRequiresExpertiseSelection(expertiseGroups);
    const expertiseRequired = totalExpertiseChoicesRequired(expertiseGroups);
    const expertiseSelected = expertiseGroups.reduce(
    (sum, group) =>
      sum + getExpertiseSelectionsForTrait(state, group).length,
      0,
    );

    if (maxSkills > 0 || cls.tool_choices.length > 0 || hasExpertise) {
      const badges: string[] = [];
      if (maxSkills > 0) {
        badges.push(`${state.class_skill_ids.length}/${maxSkills}`);
      }
      if (hasExpertise) {
        badges.push(`Exp. ${expertiseSelected}/${expertiseRequired}`);
      }
      items.push({
        id: "skills",
        label: "Perícias",
        badge: badges.length > 0 ? badges.join(" · ") : undefined,
      });
    }

    if (hasOptional) {
      items.push({
        id: "optional",
        label: "Classe",
        badge: `${optionalSelected}/${optionalRequired}`,
      });
    }

    if (hasSpells) {
      const classRequired = spellcasting
        ? spellcasting.cantrip_count +
          spellcasting.spellbook_count +
          spellcasting.prepared_count
        : 0;
      const classSelected = spellcasting
        ? state.cantrip_spell_ids.length +
          state.spellbook_spell_ids.length +
          state.prepared_spell_ids.length
        : 0;
      const featRequired =
        totalFeatSpellChoicesRequired(background.origin_feat_spellcasting) +
        totalFeatSpellChoicesRequired(humanFeat?.spellcasting) +
        progressionFeatSpellRequired;
      const featSelected = state.feat_spell_selections.length;
      const totalRequired = classRequired + featRequired;
      const totalSelected = classSelected + featSelected;
      items.push({
        id: "spells",
        label: "Magias",
        badge: totalRequired > 0 ? `${totalSelected}/${totalRequired}` : undefined,
      });
    }

    if (
      traitGroups.length > 0 ||
      background.tool_proficiency_options.some((o) => !o.tool_id)
    ) {
      items.push({ id: "traits", label: "Traços" });
    }

    if (hasFeats) {
      const progressionSlots = syncProgressionFeatSlots(state);
      const progressionFilled = progressionSlots.filter((slot) => slot.kind).length;
      const progressionTotal = progressionSlots.length;
      items.push({
        id: "feats",
        label: "Feats",
        badge:
          progressionTotal > 0
            ? `Prog. ${progressionFilled}/${progressionTotal}`
            : undefined,
      });
    }

    if (hasGear) {
      items.push({
        id: "gear",
        label: "Equipamento",
        badge: state.equipment_option_key ?? undefined,
      });
    }

    return items;
  }, [
    cls,
    species,
    background,
    humanFeat?.spellcasting,
    state.class_skill_ids.length,
    state.cantrip_spell_ids.length,
    state.spellbook_spell_ids.length,
    state.prepared_spell_ids.length,
    state.expertise_by_trait,
    state.equipment_option_key,
    state.feat_spell_selections.length,
    state.class_trait_option_selections,
    state.progression_feat_slots,
    state.human_origin_feat_id,
    progressionFeats,
    background?.origin_feat_spellcasting,
  ]);
}
