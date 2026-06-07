-- Migration: 000012 — grants Data API
-- ==========================================
-- GRANTS PARA DATA API DO SUPABASE
-- ==========================================

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

GRANT SELECT ON
    roles,
    dice,
    damage_types,
    languages,
    statuses,
    skills,
    tools,
    species,
    feats,
    backgrounds,
    traits,
    spell_lists,
    trait_option_groups,
    trait_options,
    spells,
    spell_list_spells,
    spell_rolls,
    classes,
    subclasses,
    items,
    armors,
    class_traits,
    subclass_traits,
    background_ability_options,
    background_skill_proficiencies,
    background_tool_proficiency_options,
    feat_traits,
    species_traits,
    item_traits,
    trait_spells,
    trait_option_spells,
    trait_spell_choice_groups,
    trait_option_modifiers,
    effects,
    effect_modifiers,
    effect_damage,
    effect_damage_adjustments,
    effect_statuses,
    effect_condition_adjustments,
    effect_proficiencies,
    weapon_masteries,
    weapon_properties,
    weapons,
    weapon_has_properties,
    spellcasting_progressions,
    spell_slot_progressions,
    class_spellcasting,
    class_saving_throws,
    class_weapon_proficiencies,
    class_armor_proficiencies,
    class_tool_proficiency_options,
    class_skill_choice_groups,
    class_skill_options,
    background_equipment_options,
    background_equipment_items,
    trait_resources,
    trait_resource_progressions,
    trait_resource_dice,
    trait_resource_die_progressions,
    spell_knowledge_progressions,
    spell_knowledge_by_level,
    subclass_spellcasting,

    v_character_summary,
    v_weapon_details,
    v_character_inventory,
    v_spell_list_details,
    v_background_details,
    v_character_traits,
    v_character_trait_options,
    v_character_trait_spell_choices,
    v_character_trait_option_modifiers,
    v_effect_details,
    v_character_active_effects,
    v_character_proficiency_details,
    v_character_stat_modifiers,
    v_class_spell_slots,
    v_class_proficiency_details,
    v_background_equipment_details,
    v_trait_resource_details,
    v_spell_knowledge_details
TO authenticated;

GRANT SELECT, UPDATE ON players TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    campaigns,
    characters,
    inventory,
    player_campaigns,
    player_characters,
    character_classes,
    character_skills,
    character_proficiencies,
    character_feats,
    character_trait_options,
    character_trait_spell_choices,
    character_spells,
    character_spell_slots,
    character_resources,
    character_conditions,
    character_effects
TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated, service_role;
