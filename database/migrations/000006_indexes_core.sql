-- Migration: 000006 — índices (core)
-- ==========================================
-- 9. INDICES PARA CONSULTAS COMUNS
-- ==========================================

CREATE INDEX idx_backgrounds_origin_feat ON backgrounds(origin_feat_id);
CREATE INDEX idx_languages_category ON languages(category);
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_base_attribute ON tools(base_attribute);
CREATE INDEX idx_trait_option_groups_trait ON trait_option_groups(trait_id);
CREATE INDEX idx_trait_options_trait ON trait_options(trait_id);
CREATE INDEX idx_trait_options_skill ON trait_options(skill_id);
CREATE INDEX idx_trait_options_tool ON trait_options(tool_id);
CREATE INDEX idx_trait_options_spell_list ON trait_options(spell_list_id);
CREATE INDEX idx_spell_list_spells_spell ON spell_list_spells(spell_id);
CREATE INDEX idx_spell_rolls_spell ON spell_rolls(spell_id);
CREATE INDEX idx_spell_rolls_type ON spell_rolls(roll_type);
CREATE INDEX idx_spell_rolls_damage_type ON spell_rolls(damage_type_id);
CREATE INDEX idx_subclasses_class ON subclasses(class_id);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_player_id);
CREATE INDEX idx_characters_owner ON characters(owner_player_id);
CREATE INDEX idx_characters_species ON characters(species_id);
CREATE INDEX idx_characters_background ON characters(background_id);
CREATE INDEX idx_inventory_item ON inventory(item_id);
CREATE INDEX idx_player_campaigns_player ON player_campaigns(player_id);
CREATE INDEX idx_player_campaigns_campaign ON player_campaigns(campaign_id);
CREATE INDEX idx_player_characters_player ON player_characters(player_id);
CREATE INDEX idx_player_characters_character ON player_characters(character_id);
CREATE INDEX idx_player_characters_campaign ON player_characters(campaign_id);
CREATE INDEX idx_character_classes_class ON character_classes(class_id);
CREATE INDEX idx_character_classes_subclass ON character_classes(subclass_id);
CREATE INDEX idx_class_traits_trait ON class_traits(trait_id);
CREATE INDEX idx_subclass_traits_trait ON subclass_traits(trait_id);
CREATE INDEX idx_background_ability_options_ability ON background_ability_options(ability);
CREATE INDEX idx_background_skill_proficiencies_skill ON background_skill_proficiencies(skill_id);
CREATE INDEX idx_background_tool_options_background ON background_tool_proficiency_options(background_id);
CREATE INDEX idx_background_tool_options_tool ON background_tool_proficiency_options(tool_id);
CREATE INDEX idx_background_tool_options_category ON background_tool_proficiency_options(tool_category);
CREATE INDEX idx_feat_traits_trait ON feat_traits(trait_id);
CREATE INDEX idx_species_traits_trait ON species_traits(trait_id);
CREATE INDEX idx_item_traits_trait ON item_traits(trait_id);
CREATE INDEX idx_trait_spells_spell ON trait_spells(spell_id);
CREATE INDEX idx_trait_option_spells_spell ON trait_option_spells(spell_id);
CREATE INDEX idx_trait_spell_choice_groups_trait ON trait_spell_choice_groups(trait_id);
CREATE INDEX idx_trait_option_modifiers_option ON trait_option_modifiers(trait_option_id);
CREATE INDEX idx_trait_option_modifiers_trait ON trait_option_modifiers(trait_id);
CREATE INDEX idx_character_skills_skill ON character_skills(skill_id);
CREATE INDEX idx_character_proficiencies_type ON character_proficiencies(proficiency_type, name);
CREATE INDEX idx_character_proficiencies_tool ON character_proficiencies(tool_id);
CREATE INDEX idx_character_feats_character ON character_feats(character_id);
CREATE INDEX idx_character_feats_feat ON character_feats(feat_id);
CREATE INDEX idx_character_trait_options_option ON character_trait_options(trait_option_id);
CREATE INDEX idx_character_trait_spell_choices_spell ON character_trait_spell_choices(spell_id);
CREATE INDEX idx_character_trait_spell_choices_option ON character_trait_spell_choices(trait_option_id);
CREATE INDEX idx_character_trait_spell_choices_list ON character_trait_spell_choices(spell_list_id);
CREATE INDEX idx_character_spells_spell ON character_spells(spell_id);
CREATE INDEX idx_character_resources_character ON character_resources(character_id);
CREATE INDEX idx_character_conditions_effect ON character_conditions(source_effect_id);
CREATE INDEX idx_character_conditions_active ON character_conditions(character_id, is_active);
CREATE INDEX idx_character_effects_character ON character_effects(character_id);
CREATE INDEX idx_character_effects_effect ON character_effects(effect_id);
CREATE INDEX idx_character_effects_active ON character_effects(character_id, is_active);
CREATE INDEX idx_effects_trait ON effects(trait_id);
CREATE INDEX idx_effects_spell ON effects(spell_id);
CREATE INDEX idx_effects_trait_option ON effects(trait_option_id);
CREATE INDEX idx_effect_damage_die ON effect_damage(die_id);
CREATE INDEX idx_effect_damage_type ON effect_damage(damage_type_id);
CREATE INDEX idx_effect_damage_adjustments_effect ON effect_damage_adjustments(effect_id);
CREATE INDEX idx_effect_damage_adjustments_type ON effect_damage_adjustments(damage_type_id, adjustment_type);
CREATE INDEX idx_effect_statuses_status ON effect_statuses(status_id);
CREATE INDEX idx_effect_condition_adjustments_effect ON effect_condition_adjustments(effect_id);
CREATE INDEX idx_effect_condition_adjustments_status ON effect_condition_adjustments(status_id, adjustment_type);
CREATE INDEX idx_effect_proficiencies_effect ON effect_proficiencies(effect_id);
CREATE INDEX idx_effect_proficiencies_language ON effect_proficiencies(language_id);
CREATE INDEX idx_effect_proficiencies_skill ON effect_proficiencies(skill_id);
CREATE INDEX idx_effect_proficiencies_tool ON effect_proficiencies(tool_id);
CREATE INDEX idx_character_conditions_status ON character_conditions(status_id);
CREATE INDEX idx_weapon_masteries_effect ON weapon_masteries(effect_id);
CREATE INDEX idx_weapons_damage_effect ON weapons(damage_effect_id);
CREATE INDEX idx_weapons_mastery ON weapons(mastery_id);
CREATE INDEX idx_weapon_has_properties_property ON weapon_has_properties(property_id);

CREATE UNIQUE INDEX uq_character_feats_single
    ON character_feats(character_id, feat_id)
    WHERE selection_key IS NULL;

CREATE UNIQUE INDEX uq_character_feats_selection
    ON character_feats(character_id, feat_id, selection_key)
    WHERE selection_key IS NOT NULL;
