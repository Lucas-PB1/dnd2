-- Migration: 000008 — views
-- ==========================================
-- VIEWS
-- ==========================================

CREATE VIEW v_character_summary
WITH (security_invoker = true) AS
SELECT
    c.id AS character_id,
    c.name,
    c.level,
    c.size,
    c.speed,
    c.current_hp,
    c.max_hp,
    c.temporary_hp,
    c.death_save_successes,
    c.death_save_failures,
    c.heroic_inspiration,
    c.armor_class,
    c.proficiency_bonus,
    s.name AS species_name,
    b.name AS background_name,
    (
        SELECT string_agg(cl.name || ' ' || cc.class_level, ', ' ORDER BY cl.name)
        FROM character_classes cc
        JOIN classes cl ON cl.id = cc.class_id
        WHERE cc.character_id = c.id
    ) AS classes,
    (
        SELECT string_agg(f.name || COALESCE(' [' || cf.selection_key || ']', ''), ', ' ORDER BY f.name)
        FROM character_feats cf
        JOIN feats f ON f.id = cf.feat_id
        WHERE cf.character_id = c.id
    ) AS feats,
    (
        SELECT string_agg(st.name, ', ' ORDER BY st.name)
        FROM character_conditions cc
        JOIN statuses st ON st.id = cc.status_id
        WHERE cc.character_id = c.id
          AND cc.is_active
    ) AS conditions
FROM characters c
LEFT JOIN species s ON s.id = c.species_id
LEFT JOIN backgrounds b ON b.id = c.background_id;

CREATE VIEW v_weapon_details
WITH (security_invoker = true) AS
SELECT
    i.id AS item_id,
    i.name,
    w.weapon_category,
    d.name AS damage_die,
    ed.die_count,
    ed.flat_bonus,
    dt.name AS damage_type,
    wm.name AS mastery_name,
    wm.effect_id AS mastery_effect_id,
    w.range_normal,
    w.range_long,
    w.is_two_handed,
    (
        SELECT string_agg(
            wp.name || COALESCE(' (' || whp.details || ')', ''),
            ', '
            ORDER BY wp.name
        )
        FROM weapon_has_properties whp
        JOIN weapon_properties wp ON wp.id = whp.property_id
        WHERE whp.item_id = w.item_id
    ) AS properties
FROM weapons w
JOIN items i ON i.id = w.item_id
LEFT JOIN effect_damage ed ON ed.effect_id = w.damage_effect_id
LEFT JOIN dice d ON d.id = ed.die_id
LEFT JOIN damage_types dt ON dt.id = ed.damage_type_id
LEFT JOIN weapon_masteries wm ON wm.id = w.mastery_id;

CREATE OR REPLACE VIEW v_character_inventory
WITH (security_invoker = true) AS
SELECT
    inv.character_id,
    i.id AS item_id,
    i.name,
    inv.quantity,
    inv.is_equipped,
    CASE
        WHEN vd.item_id IS NOT NULL THEN 'Weapon'
        WHEN a.item_id IS NOT NULL THEN 'Armor'
        ELSE 'Item'
    END AS item_type,
    i.cost_gp,
    i.weight_lb,
    i.is_magical,
    vd.weapon_category,
    vd.damage_die,
    vd.die_count,
    vd.flat_bonus,
    vd.damage_type,
    vd.mastery_name,
    vd.properties AS weapon_properties,
    a.category AS armor_category,
    a.ac_bonus,
    a.min_strength,
    a.stealth_disadvantage,
    a.plus_dex_modifier,
    a.max_dex_bonus,
    inv.is_attuned,
    i.requires_attunement,
    i.is_consumable
FROM inventory inv
JOIN items i ON i.id = inv.item_id
LEFT JOIN v_weapon_details vd ON vd.item_id = i.id
LEFT JOIN armors a ON a.item_id = i.id;

CREATE VIEW v_spell_list_details
WITH (security_invoker = true) AS
SELECT
    sl.id AS spell_list_id,
    sl.name AS spell_list_name,
    sl.source_type,
    sl.description AS spell_list_description,
    sp.id AS spell_id,
    sp.name AS spell_name,
    sp.level,
    sp.school,
    sp.requires_concentration,
    sp.requires_ritual,
    sp.save_attribute,
    sp.attack_type,
    sp.can_affect_character,
    sp.character_effect_scope,
    sp.character_effect_category,
    sp.character_effect_summary,
    EXISTS (
        SELECT 1
        FROM spell_rolls sr
        WHERE sr.spell_id = sp.id
    ) AS has_rolls,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'spell_roll_id', sr.id,
                'roll_label', sr.roll_label,
                'roll_type', sr.roll_type,
                'damage_type', dt.name,
                'damage_type_options', sr.damage_type_options,
                'formula', sr.formula,
                'base_cast_level', sr.base_cast_level,
                'minimum_cast_level', sr.minimum_cast_level,
                'scaling_type', sr.scaling_type,
                'scaling_formula', sr.scaling_formula,
                'roll_context', sr.roll_context
            )
            ORDER BY sr.sort_order, sr.roll_label
        )
        FROM spell_rolls sr
        LEFT JOIN damage_types dt ON dt.id = sr.damage_type_id
        WHERE sr.spell_id = sp.id
    ), '[]'::JSONB) AS spell_rolls
FROM spell_lists sl
JOIN spell_list_spells sls ON sls.spell_list_id = sl.id
JOIN spells sp ON sp.id = sls.spell_id;

CREATE VIEW v_background_details
WITH (security_invoker = true) AS
SELECT
    b.id AS background_id,
    b.name,
    b.description,
    b.origin_feat_id,
    f.name AS origin_feat_name,
    b.origin_feat_selection_key,
    COALESCE((
        SELECT jsonb_agg(bao.ability ORDER BY bao.ability)
        FROM background_ability_options bao
        WHERE bao.background_id = b.id
    ), '[]'::JSONB) AS ability_options,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'skill_id', sk.id,
                'name', sk.name,
                'base_attribute', sk.base_attribute
            )
            ORDER BY sk.name
        )
        FROM background_skill_proficiencies bsp
        JOIN skills sk ON sk.id = bsp.skill_id
        WHERE bsp.background_id = b.id
    ), '[]'::JSONB) AS skill_proficiencies,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', btp.id,
                'option_group', btp.option_group,
                'choice_count', btp.choice_count,
                'tool_id', tl.id,
                'tool_name', tl.name,
                'tool_category', COALESCE(tl.category, btp.tool_category),
                'name', btp.name,
                'notes', btp.notes
            )
            ORDER BY btp.option_group, btp.name
        )
        FROM background_tool_proficiency_options btp
        LEFT JOIN tools tl ON tl.id = btp.tool_id
        WHERE btp.background_id = b.id
    ), '[]'::JSONB) AS tool_proficiency_options
FROM backgrounds b
LEFT JOIN feats f ON f.id = b.origin_feat_id;

CREATE OR REPLACE VIEW v_character_traits
WITH (security_invoker = true) AS
SELECT
    c.id AS character_id,
    t.id AS trait_id,
    t.name AS trait_name,
    'species'::TEXT AS source_type,
    s.name AS source_name,
    NULL::INT AS level_required
FROM characters c
JOIN species s ON s.id = c.species_id
JOIN species_traits st ON st.species_id = s.id
JOIN traits t ON t.id = st.trait_id

UNION ALL

SELECT
    cc.character_id,
    t.id AS trait_id,
    t.name AS trait_name,
    'class'::TEXT AS source_type,
    cl.name AS source_name,
    ct.level_required
FROM character_classes cc
JOIN classes cl ON cl.id = cc.class_id
JOIN class_traits ct ON ct.class_id = cl.id
JOIN traits t ON t.id = ct.trait_id
WHERE cc.class_level >= ct.level_required

UNION ALL

SELECT
    cc.character_id,
    t.id AS trait_id,
    t.name AS trait_name,
    'subclass'::TEXT AS source_type,
    cl.name || ': ' || sc.name AS source_name,
    st.level_required
FROM character_classes cc
JOIN classes cl ON cl.id = cc.class_id
JOIN subclasses sc ON sc.id = cc.subclass_id
JOIN subclass_traits st ON st.subclass_id = sc.id
JOIN traits t ON t.id = st.trait_id
WHERE cc.class_level >= st.level_required

UNION ALL

SELECT
    inv.character_id,
    t.id AS trait_id,
    t.name AS trait_name,
    'item'::TEXT AS source_type,
    i.name AS source_name,
    NULL::INT AS level_required
FROM inventory inv
JOIN items i ON i.id = inv.item_id
JOIN item_traits it ON it.item_id = i.id
JOIN traits t ON t.id = it.trait_id
WHERE (
        (t.activation_scope = 'equipped' AND inv.is_equipped)
        OR (t.activation_scope = 'carried' AND inv.quantity > 0)
    )
  AND (NOT i.requires_attunement OR inv.is_attuned)

UNION ALL

SELECT
    cf.character_id,
    t.id AS trait_id,
    t.name AS trait_name,
    'feat'::TEXT AS source_type,
    f.name || COALESCE(' [' || cf.selection_key || ']', '') AS source_name,
    NULL::INT AS level_required
FROM character_feats cf
JOIN feats f ON f.id = cf.feat_id
JOIN feat_traits ft ON ft.feat_id = f.id
JOIN traits t ON t.id = ft.trait_id;

CREATE VIEW v_character_trait_options
WITH (security_invoker = true) AS
SELECT
    cto.character_id,
    cto.trait_id,
    t.name AS trait_name,
    cto.option_group,
    tog.choice_count,
    tog.is_required,
    tog.notes AS option_group_notes,
    cto.selection_key,
    cto.trait_option_id,
    tro.name AS option_name,
    tro.description AS option_description,
    tro.skill_id AS option_skill_id,
    option_skill.name AS option_skill_name,
    option_skill.base_attribute AS option_skill_base_attribute,
    tro.tool_id AS option_tool_id,
    option_tool.name AS option_tool_name,
    option_tool.category AS option_tool_category,
    option_tool.base_attribute AS option_tool_base_attribute,
    tro.spell_list_id AS option_spell_list_id,
    option_spell_list.name AS option_spell_list_name,
    cto.source_type,
    cto.source_id,
    cto.notes
FROM character_trait_options cto
JOIN trait_options tro ON tro.id = cto.trait_option_id
JOIN trait_option_groups tog ON tog.trait_id = cto.trait_id
    AND tog.option_group = cto.option_group
JOIN traits t ON t.id = cto.trait_id
LEFT JOIN skills option_skill ON option_skill.id = tro.skill_id
LEFT JOIN tools option_tool ON option_tool.id = tro.tool_id
LEFT JOIN spell_lists option_spell_list ON option_spell_list.id = tro.spell_list_id;

CREATE VIEW v_character_trait_spell_choices
WITH (security_invoker = true) AS
SELECT
    ctsc.character_id,
    ctsc.trait_id,
    t.name AS trait_name,
    ctsc.choice_group,
    tscg.choice_count,
    ctsc.spell_level,
    tscg.always_prepared,
    tscg.free_casts_per,
    ctsc.selection_key,
    ctsc.spell_id,
    sp.name AS spell_name,
    sp.level,
    sp.school,
    ctsc.trait_option_id,
    tro.name AS trait_option_name,
    ctsc.spell_list_id,
    sl.name AS spell_list_name,
    ctsc.source_type,
    ctsc.source_id,
    ctsc.notes
FROM character_trait_spell_choices ctsc
JOIN traits t ON t.id = ctsc.trait_id
JOIN trait_spell_choice_groups tscg ON tscg.trait_id = ctsc.trait_id
    AND tscg.choice_group = ctsc.choice_group
JOIN spells sp ON sp.id = ctsc.spell_id
LEFT JOIN trait_options tro ON tro.id = ctsc.trait_option_id
LEFT JOIN spell_lists sl ON sl.id = ctsc.spell_list_id;

CREATE VIEW v_character_trait_option_modifiers
WITH (security_invoker = true) AS
SELECT
    cto.character_id,
    cto.trait_id,
    t.name AS trait_name,
    cto.option_group,
    cto.selection_key,
    cto.trait_option_id,
    tro.name AS option_name,
    tom.choice_mode_key,
    tom.affected_stat,
    tom.operation,
    tom.modifier_value,
    tom.max_value,
    tom.scope_text
FROM character_trait_options cto
JOIN trait_options tro ON tro.id = cto.trait_option_id
JOIN traits t ON t.id = cto.trait_id
JOIN trait_option_modifiers tom ON tom.trait_option_id = cto.trait_option_id;

CREATE VIEW v_effect_details
WITH (security_invoker = true) AS
SELECT
    e.id AS effect_id,
    e.trait_id,
    tr.name AS source_trait_name,
    e.spell_id,
    sp.name AS source_spell_name,
    e.trait_option_id,
    tro.name AS source_trait_option_name,
    tro.option_group AS source_trait_option_group,
    option_trait.name AS source_trait_option_trait_name,
    e.name AS effect_name,
    e.effect_type,
    e.duration_text,
    e.requires_choice,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'affected_stat', em.affected_stat,
                'operation', em.operation,
                'modifier_value', em.modifier_value
            )
            ORDER BY em.affected_stat, em.operation
        )
        FROM effect_modifiers em
        WHERE em.effect_id = e.id
    ), '[]'::JSONB) AS modifiers,
    (
        SELECT jsonb_build_object(
            'die', d.name,
            'die_count', ed.die_count,
            'flat_bonus', ed.flat_bonus,
            'damage_type', dt.name
        )
        FROM effect_damage ed
        LEFT JOIN dice d ON d.id = ed.die_id
        LEFT JOIN damage_types dt ON dt.id = ed.damage_type_id
        WHERE ed.effect_id = e.id
    ) AS damage,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'damage_type', dt.name,
                'adjustment_type', eda.adjustment_type,
                'scope_text', eda.scope_text
            )
            ORDER BY dt.name, eda.adjustment_type
        )
        FROM effect_damage_adjustments eda
        JOIN damage_types dt ON dt.id = eda.damage_type_id
        WHERE eda.effect_id = e.id
    ), '[]'::JSONB) AS damage_adjustments,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'status', st.name,
                'duration_text', es.duration_text,
                'scope_text', es.scope_text
            )
            ORDER BY st.name
        )
        FROM effect_statuses es
        JOIN statuses st ON st.id = es.status_id
        WHERE es.effect_id = e.id
    ), '[]'::JSONB) AS statuses,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'status', st.name,
                'adjustment_type', eca.adjustment_type,
                'scope_text', eca.scope_text
            )
            ORDER BY st.name, eca.adjustment_type
        )
        FROM effect_condition_adjustments eca
        JOIN statuses st ON st.id = eca.status_id
        WHERE eca.effect_id = e.id
    ), '[]'::JSONB) AS condition_adjustments,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'proficiency_type', ep.proficiency_type,
                'language', l.name,
                'skill', sk.name,
                'skill_base_attribute', sk.base_attribute,
                'tool', tl.name,
                'tool_category', tl.category,
                'tool_base_attribute', tl.base_attribute,
                'name', COALESCE(l.name, sk.name, tl.name, ep.name),
                'requires_choice', ep.requires_choice,
                'choice_count', ep.choice_count,
                'notes', ep.notes
            )
            ORDER BY ep.proficiency_type, COALESCE(l.name, sk.name, tl.name, ep.name)
        )
        FROM effect_proficiencies ep
        LEFT JOIN languages l ON l.id = ep.language_id
        LEFT JOIN skills sk ON sk.id = ep.skill_id
        LEFT JOIN tools tl ON tl.id = ep.tool_id
        WHERE ep.effect_id = e.id
    ), '[]'::JSONB) AS proficiencies
FROM effects e
LEFT JOIN traits tr ON tr.id = e.trait_id
LEFT JOIN spells sp ON sp.id = e.spell_id
LEFT JOIN trait_options tro ON tro.id = e.trait_option_id
LEFT JOIN traits option_trait ON option_trait.id = tro.trait_id;

CREATE VIEW v_character_active_effects
WITH (security_invoker = true) AS
SELECT
    ct.character_id,
    ct.source_type,
    ct.source_name,
    ct.trait_id,
    ct.trait_name,
    ed.spell_id,
    ed.source_spell_name AS spell_name,
    NULL::INT AS character_effect_id,
    ed.effect_id,
    ed.effect_name,
    ed.effect_type,
    ed.duration_text,
    ed.requires_choice,
    TRUE AS is_active,
    ed.duration_text AS timing_text,
    ed.modifiers,
    ed.damage,
    ed.damage_adjustments,
    ed.statuses,
    ed.condition_adjustments,
    ed.proficiencies
FROM v_character_traits ct
JOIN v_effect_details ed ON ed.trait_id = ct.trait_id

UNION ALL

SELECT
    cto.character_id,
    'trait_option'::TEXT AS source_type,
    cto.trait_name || ': ' || cto.option_name AS source_name,
    cto.trait_id,
    cto.trait_name,
    ed.spell_id,
    ed.source_spell_name AS spell_name,
    NULL::INT AS character_effect_id,
    ed.effect_id,
    ed.effect_name,
    ed.effect_type,
    ed.duration_text,
    ed.requires_choice,
    TRUE AS is_active,
    ed.duration_text AS timing_text,
    ed.modifiers,
    ed.damage,
    ed.damage_adjustments,
    ed.statuses,
    ed.condition_adjustments,
    ed.proficiencies
FROM v_character_trait_options cto
JOIN v_effect_details ed ON ed.trait_option_id = cto.trait_option_id

UNION ALL

SELECT
    ce.character_id,
    COALESCE(ce.source_type, 'active_effect') AS source_type,
    COALESCE(ed.source_spell_name, ed.source_trait_name, ce.source_type, 'Active Effect') AS source_name,
    ed.trait_id,
    ed.source_trait_name AS trait_name,
    ed.spell_id,
    ed.source_spell_name AS spell_name,
    ce.id AS character_effect_id,
    ed.effect_id,
    ed.effect_name,
    ed.effect_type,
    ed.duration_text,
    ed.requires_choice,
    ce.is_active,
    COALESCE(ce.timing_text, ed.duration_text) AS timing_text,
    ed.modifiers,
    ed.damage,
    ed.damage_adjustments,
    ed.statuses,
    ed.condition_adjustments,
    ed.proficiencies
FROM character_effects ce
JOIN v_effect_details ed ON ed.effect_id = ce.effect_id
WHERE ce.is_active;

CREATE VIEW v_character_proficiency_details
WITH (security_invoker = true) AS
SELECT
    cp.character_id,
    cp.proficiency_type,
    COALESCE(cp_tool.name, cp.name) AS name,
    NULL::VARCHAR(30) AS language_category,
    cp.source_type,
    cp.source_id,
    NULL::INT AS effect_id,
    FALSE AS requires_choice,
    1 AS choice_count,
    NULL::TEXT AS notes
FROM character_proficiencies cp
LEFT JOIN tools cp_tool ON cp_tool.id = cp.tool_id

UNION ALL

SELECT
    cae.character_id,
    ep.proficiency_type,
    COALESCE(l.name, sk.name, tl.name, ep.name, 'Choice') AS name,
    l.category AS language_category,
    cae.source_type,
    cae.character_effect_id AS source_id,
    ep.effect_id,
    ep.requires_choice,
    ep.choice_count,
    ep.notes
FROM v_character_active_effects cae
JOIN effect_proficiencies ep ON ep.effect_id = cae.effect_id
LEFT JOIN languages l ON l.id = ep.language_id
LEFT JOIN skills sk ON sk.id = ep.skill_id
LEFT JOIN tools tl ON tl.id = ep.tool_id

UNION ALL

SELECT
    cto.character_id,
    CASE
        WHEN cto.option_skill_id IS NOT NULL THEN 'skill'
        ELSE 'tool'
    END AS proficiency_type,
    COALESCE(cto.option_skill_name, cto.option_tool_name) AS name,
    NULL::VARCHAR(30) AS language_category,
    'trait_option'::TEXT AS source_type,
    cto.trait_option_id AS source_id,
    NULL::INT AS effect_id,
    FALSE AS requires_choice,
    1 AS choice_count,
    cto.trait_name || ': ' || cto.option_name AS notes
FROM v_character_trait_options cto
WHERE cto.option_skill_id IS NOT NULL
   OR cto.option_tool_id IS NOT NULL;

CREATE OR REPLACE VIEW v_character_stat_modifiers
WITH (security_invoker = true) AS
SELECT
    cae.character_id,
    cae.source_type,
    cae.source_name,
    cae.trait_id,
    cae.trait_name,
    cae.effect_id,
    cae.effect_name,
    cae.character_effect_id,
    cae.is_active,
    em.affected_stat,
    em.operation,
    em.modifier_value
FROM v_character_active_effects cae
JOIN effect_modifiers em ON em.effect_id = cae.effect_id

UNION ALL

SELECT
    ctom.character_id,
    'trait_option'::TEXT AS source_type,
    ctom.trait_name || ': ' || ctom.option_name AS source_name,
    ctom.trait_id,
    ctom.trait_name,
    NULL::INT AS effect_id,
    ctom.trait_name || ': ' || ctom.option_name AS effect_name,
    NULL::INT AS character_effect_id,
    TRUE AS is_active,
    ctom.affected_stat,
    ctom.operation,
    ctom.modifier_value
FROM v_character_trait_option_modifiers ctom;

CREATE VIEW v_class_spell_slots
WITH (security_invoker = true) AS
SELECT
    c.id AS class_id,
    c.name AS class_name,
    sp.slug AS progression_slug,
    sp.progression_type,
    sp.slot_recovery,
    cs.spellcasting_ability,
    cs.cantrip_progression,
    cs.uses_spellbook,
    ssp.class_level,
    ssp.slot_level,
    ssp.slot_count
FROM class_spellcasting cs
JOIN classes c ON c.id = cs.class_id
JOIN spellcasting_progressions sp ON sp.id = cs.progression_id
JOIN spell_slot_progressions ssp ON ssp.progression_id = sp.id;

CREATE VIEW v_class_proficiency_details
WITH (security_invoker = true) AS
SELECT
    c.id AS class_id,
    c.name AS class_name,
    'save' AS proficiency_type,
    cst.ability AS name,
    NULL::INT AS skill_id,
    NULL::INT AS tool_id,
    NULL::VARCHAR(30) AS tool_category,
    FALSE AS requires_choice,
    1 AS choice_count,
    NULL::TEXT AS notes
FROM classes c
JOIN class_saving_throws cst ON cst.class_id = c.id

UNION ALL

SELECT
    c.id,
    c.name,
    'weapon',
    cwp.name,
    NULL,
    NULL,
    NULL,
    FALSE,
    1,
    cwp.notes
FROM classes c
JOIN class_weapon_proficiencies cwp ON cwp.class_id = c.id

UNION ALL

SELECT
    c.id,
    c.name,
    'armor',
    cap.name,
    NULL,
    NULL,
    NULL,
    FALSE,
    1,
    NULL
FROM classes c
JOIN class_armor_proficiencies cap ON cap.class_id = c.id

UNION ALL

SELECT
    c.id,
    c.name,
    'tool',
    cto.name,
    NULL,
    cto.tool_id,
    cto.tool_category,
    TRUE,
    cto.choice_count,
    cto.notes
FROM classes c
JOIN class_tool_proficiency_options cto ON cto.class_id = c.id

UNION ALL

SELECT
    c.id,
    c.name,
    'skill',
    sk.name,
    cso.skill_id,
    NULL,
    NULL,
    TRUE,
    cscg.choice_count,
    cscg.notes
FROM classes c
JOIN class_skill_choice_groups cscg ON cscg.class_id = c.id
JOIN class_skill_options cso ON cso.class_id = c.id AND cso.choice_group = cscg.choice_group
JOIN skills sk ON sk.id = cso.skill_id;

CREATE VIEW v_background_equipment_details
WITH (security_invoker = true) AS
SELECT
    b.id AS background_id,
    b.name AS background_name,
    beo.option_key,
    beo.label,
    beo.gp_amount,
    beo.notes AS option_notes,
    bei.item_name,
    bei.quantity,
    bei.notes AS item_notes,
    i.id AS item_id,
    i.is_magical
FROM backgrounds b
JOIN background_equipment_options beo ON beo.background_id = b.id
LEFT JOIN background_equipment_items bei ON bei.equipment_option_id = beo.id
LEFT JOIN items i ON i.id = bei.item_id;

CREATE VIEW v_trait_resource_details
WITH (security_invoker = true) AS
SELECT
    tr.id AS trait_resource_id,
    t.id AS trait_id,
    t.name AS trait_name,
    tr.resource_key,
    tr.resource_name,
    tr.count_type,
    tr.ability,
    tr.minimum_count,
    tr.pool_multiplier,
    tr.reset_on,
    tr.short_rest_recovery,
    tr.long_rest_recovery,
    trp.class_level,
    trp.resource_count,
    trp.die_value,
    trp.bonus_value
FROM trait_resources tr
JOIN traits t ON t.id = tr.trait_id
LEFT JOIN trait_resource_progressions trp ON trp.trait_resource_id = tr.id;

CREATE VIEW v_spell_knowledge_details
WITH (security_invoker = true) AS
SELECT
    skp.slug AS progression_slug,
    skp.name AS progression_name,
    skp.knowledge_type,
    skbl.class_level,
    skbl.knowledge_count,
    c.id AS class_id,
    c.name AS class_name,
    cs.spellcasting_ability,
    cs.cantrip_progression AS cantrip_progression_slug,
    cs.prepared_progression_slug
FROM spell_knowledge_progressions skp
JOIN spell_knowledge_by_level skbl ON skbl.progression_slug = skp.slug
LEFT JOIN class_spellcasting cs
    ON cs.cantrip_progression = skp.slug
    OR cs.prepared_progression_slug = skp.slug
LEFT JOIN classes c ON c.id = cs.class_id;
