import { toggleIdList, toggleTraitOption } from "@/features/character-builder/domain/utils";
import { eligibleSkillsForExpertiseGroup } from "@/features/character-builder/domain/expertise/class-expertise";
import { toggleSpellId } from "@/features/character-builder/domain/spells/class-spells";
import { toggleFeatSpell } from "@/features/character-builder/domain/spells/feat-spells";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
  ToolProficiencySelection,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { selectedBackground, selectedClass } from "./selectors";

function pruneExpertiseSelections(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
): Record<string, number[]> {
  const cls = selectedClass(data, state);
  if (!cls) return state.expertise_by_trait;

  const next: Record<string, number[]> = {};
  for (const group of cls.expertise_choices) {
    const key = `${group.trait_id}:${group.level_required}`;
    const eligible = new Set(
      eligibleSkillsForExpertiseGroup(data, state, group).map((s) => s.skill_id),
    );
    next[key] = (state.expertise_by_trait[key] ?? []).filter((id) =>
      eligible.has(id),
    );
  }
  return next;
}

export function toggleClassSkill(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  skillId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  if (!cls) return state;

  const max = cls.skill_choices.reduce(
    (sum, group) => sum + group.choice_count,
    0,
  );

  const nextState = {
    ...state,
    class_skill_ids: toggleIdList(state.class_skill_ids, skillId, max),
  };

  return {
    ...nextState,
    expertise_by_trait: pruneExpertiseSelections(nextState, data),
  };
}

export function toggleSpeciesTraitOption(
  state: CharacterBuilderState,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  return {
    ...state,
    species_trait_options: toggleTraitOption(
      state.species_trait_options,
      selection,
      max,
    ),
  };
}

export function toggleOriginFeatTraitOption(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  const background = selectedBackground(data, state);
  const enriched: TraitOptionSelection = {
    ...selection,
    selection_key:
      background?.origin_feat_selection_key ?? selection.selection_key,
  };

  const nextOptions = toggleTraitOption(
    state.origin_feat_trait_options,
    enriched,
    max,
  );

  const spellListChanged =
    background?.origin_feat_spellcasting &&
    selection.option_group ===
      background.origin_feat_spellcasting.spell_list_option_group;

  return {
    ...state,
    origin_feat_trait_options: nextOptions,
    feat_spell_selections: spellListChanged
      ? state.feat_spell_selections.filter((entry) => entry.source !== "background")
      : state.feat_spell_selections,
  };
}

export function toggleHumanOriginFeatTraitOption(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );
  const nextOptions = toggleTraitOption(
    state.human_origin_feat_trait_options,
    selection,
    max,
  );

  const spellListChanged =
    humanFeat?.spellcasting &&
    selection.option_group === humanFeat.spellcasting.spell_list_option_group;

  return {
    ...state,
    human_origin_feat_trait_options: nextOptions,
    feat_spell_selections: spellListChanged
      ? state.feat_spell_selections.filter((entry) => entry.source !== "human")
      : state.feat_spell_selections,
  };
}

export function setHumanOriginFeat(
  state: CharacterBuilderState,
  featId: number,
): CharacterBuilderState {
  if (state.human_origin_feat_id === featId) return state;

  return {
    ...state,
    human_origin_feat_id: featId,
    human_origin_feat_trait_options: [],
    feat_spell_selections: state.feat_spell_selections.filter(
      (entry) => entry.source !== "human",
    ),
  };
}

export { toggleFeatSpell };

export function setBackgroundTool(
  state: CharacterBuilderState,
  tool: ToolProficiencySelection,
): CharacterBuilderState {
  return {
    ...state,
    background_tool_selections: [tool],
  };
}

export function setClassTool(
  state: CharacterBuilderState,
  tool: ToolProficiencySelection,
): CharacterBuilderState {
  return {
    ...state,
    class_tool_selections: [tool],
  };
}

export function toggleCantripSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.cantrip_count ?? 0;
  if (max === 0) return state;

  const cantrip_spell_ids = toggleSpellId(state.cantrip_spell_ids, spellId, max);
  return { ...state, cantrip_spell_ids };
}

export function toggleSpellbookSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.spellbook_count ?? 0;
  if (max === 0) return state;

  const spellbook_spell_ids = toggleSpellId(
    state.spellbook_spell_ids,
    spellId,
    max,
  );
  const prepared_spell_ids = state.prepared_spell_ids.filter((id) =>
    spellbook_spell_ids.includes(id),
  );

  return { ...state, spellbook_spell_ids, prepared_spell_ids };
}

export function togglePreparedSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.prepared_count ?? 0;
  if (max === 0) return state;

  return {
    ...state,
    prepared_spell_ids: toggleSpellId(state.prepared_spell_ids, spellId, max),
  };
}
