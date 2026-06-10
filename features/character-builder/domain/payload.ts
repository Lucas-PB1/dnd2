import { abilityModifier } from "@/features/character-builder/domain/abilities/abilities";
import {
  buildEquipmentInventory,
  resolveStartingGoldGp,
} from "@/features/character-builder/domain/equipment/equipment-mode";
import {
  buildClassesRpcPayload,
  computeMulticlassMaxHp,
} from "@/features/character-builder/domain/multiclass/multiclass";
import { buildProgressionFeatsPayload } from "@/features/character-builder/domain/progression/feats";
import { applyProgressionAbilityDeltas } from "@/features/character-builder/domain/progression/asi";
import { buildSpellsRpcPayload } from "@/features/character-builder/domain/spells/class-spells";
import { buildFeatSpellsRpcPayload } from "@/features/character-builder/domain/spells/feat-spells";
import { resolvePayloadCore } from "@/features/character-builder/domain/payload-core";
import { toCreateCharacterRpcBody } from "@/features/character-builder/domain/payload-rpc";
import { buildToolProficiencies } from "@/features/character-builder/domain/payload-tools";
import { buildTraitOptions } from "@/features/character-builder/domain/payload-traits";
import { validatePayloadChoices } from "@/features/character-builder/domain/payload-validation";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
  CreateCharacterBuilderPayload,
} from "@/features/character-builder/types/builder.types";

export { toCreateCharacterRpcBody };

export function buildRpcPayloadFromBuilderState(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): CreateCharacterBuilderPayload {
  const { cls, species, background, name, size, abilities } =
    resolvePayloadCore(data, state);
  const { skillsPayload, spellsRequired } = validatePayloadChoices(
    cls,
    data,
    state,
    abilities,
  );
  const abilitiesForDerivedStats = applyProgressionAbilityDeltas(
    abilities,
    data,
    state,
  );
  const maxHp = computeMulticlassMaxHp(
    state,
    data.classes,
    abilityModifier(abilitiesForDerivedStats.CON),
  );

  return {
    name,
    class_id: cls.id,
    class_level: state.class_level,
    subclass_id: state.subclass_id,
    classes: buildClassesRpcPayload(state),
    species_id: species.id,
    background_id: background.id,
    size,
    abilities,
    max_hp: maxHp,
    starting_gold_gp: resolveStartingGoldGp(state),
    class_skill_ids: state.class_skill_ids,
    proficiencies: buildToolProficiencies(cls, background, state),
    trait_options: buildTraitOptions(data, state, background, species),
    feats: buildFeatsPayload(data, state, species.id),
    inventory: buildEquipmentInventory(background, state),
    spells: spellsRequired ? buildSpellsRpcPayload(state) : [],
    trait_spell_choices: buildFeatSpellsRpcPayload(data, state),
    _skillsPayload: skillsPayload,
  } as CreateCharacterBuilderPayload & { _skillsPayload: typeof skillsPayload };
}

function buildFeatsPayload(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  speciesId: number,
): CreateCharacterBuilderPayload["feats"] {
  const feats: CreateCharacterBuilderPayload["feats"] = [];

  if (state.human_origin_feat_id) {
    feats.push({
      feat_id: state.human_origin_feat_id,
      source_type: "species",
      source_id: speciesId,
    });
  }

  feats.push(...buildProgressionFeatsPayload(data, state));
  return feats;
}
