-- Migration: 000046 — reliable D&D 2024 character sheet calculations

ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_check;

CREATE OR REPLACE FUNCTION private.weapon_has_property(
    p_properties TEXT,
    p_property TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT position(lower(p_property) in lower(COALESCE(p_properties, ''))) > 0;
$$;

CREATE OR REPLACE FUNCTION private.character_weapon_attack_ability(
    p_character_id INT,
    p_weapon_category TEXT,
    p_weapon_properties TEXT
)
RETURNS VARCHAR(3)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE
        WHEN private.weapon_has_property(p_weapon_properties, 'Finesse') THEN
            CASE
                WHEN private.ability_modifier(private.character_ability_score(p_character_id, 'DEX'))
                   > private.ability_modifier(private.character_ability_score(p_character_id, 'STR'))
                THEN 'DEX'
                WHEN private.ability_modifier(private.character_ability_score(p_character_id, 'STR'))
                   > private.ability_modifier(private.character_ability_score(p_character_id, 'DEX'))
                THEN 'STR'
                WHEN COALESCE(p_weapon_category, '') LIKE '%Melee%' THEN 'STR'
                ELSE 'DEX'
            END
        WHEN COALESCE(p_weapon_category, '') LIKE '%Melee%' THEN 'STR'
        ELSE 'DEX'
    END;
$$;

CREATE OR REPLACE FUNCTION private.weapon_attack_ability_options(
    p_weapon_category TEXT,
    p_weapon_properties TEXT
)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN private.weapon_has_property(p_weapon_properties, 'Finesse')
        THEN '["STR", "DEX"]'::JSONB
        WHEN COALESCE(p_weapon_category, '') LIKE '%Melee%'
        THEN '["STR"]'::JSONB
        ELSE '["DEX"]'::JSONB
    END;
$$;

CREATE OR REPLACE FUNCTION private.character_has_weapon_training(
    p_character_id INT,
    p_weapon_name TEXT,
    p_weapon_category TEXT,
    p_weapon_properties TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH weapon AS (
        SELECT
            lower(COALESCE(p_weapon_name, '')) AS weapon_name,
            CASE
                WHEN COALESCE(p_weapon_category, '') LIKE 'Simple%' THEN 'simple'
                WHEN COALESCE(p_weapon_category, '') LIKE 'Martial%' THEN 'martial'
                ELSE NULL
            END AS category_group,
            private.weapon_has_property(p_weapon_properties, 'Finesse') AS has_finesse,
            private.weapon_has_property(p_weapon_properties, 'Light') AS has_light
    )
    SELECT EXISTS (
        SELECT 1
        FROM character_proficiencies cp
        CROSS JOIN weapon w
        WHERE cp.character_id = p_character_id
          AND cp.proficiency_type = 'weapon'
          AND (
              lower(cp.name) = w.weapon_name
              OR (w.category_group = 'simple' AND lower(cp.name) = 'simple weapons')
              OR (w.category_group = 'martial' AND lower(cp.name) = 'martial weapons')
              OR (
                  w.category_group = 'martial'
                  AND lower(cp.name) = 'martial weapons that have the light property'
                  AND w.has_light
              )
              OR (
                  w.category_group = 'martial'
                  AND lower(cp.name) = 'martial weapons that have the finesse or light property'
                  AND (w.has_finesse OR w.has_light)
              )
          )
    );
$$;

CREATE OR REPLACE FUNCTION private.ability_stat_name(p_ability VARCHAR)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE upper(p_ability)
        WHEN 'STR' THEN 'strength'
        WHEN 'DEX' THEN 'dexterity'
        WHEN 'CON' THEN 'constitution'
        WHEN 'INT' THEN 'intelligence'
        WHEN 'WIS' THEN 'wisdom'
        WHEN 'CHA' THEN 'charisma'
        ELSE NULL
    END;
$$;

CREATE OR REPLACE FUNCTION private.character_modifier_add_bonus(
    p_character_id INT,
    p_stats TEXT[]
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(COALESCE(sm.modifier_value, 0)), 0)::INT
    FROM v_character_stat_modifiers sm
    WHERE sm.character_id = p_character_id
      AND sm.is_active
      AND sm.operation = 'add'
      AND sm.affected_stat = ANY(p_stats);
$$;

CREATE OR REPLACE FUNCTION private.character_modifier_max_set(
    p_character_id INT,
    p_stats TEXT[]
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT MAX(sm.modifier_value)::INT
    FROM v_character_stat_modifiers sm
    WHERE sm.character_id = p_character_id
      AND sm.is_active
      AND sm.operation = 'set'
      AND sm.affected_stat = ANY(p_stats);
$$;

CREATE OR REPLACE FUNCTION private.character_ability_score(
    p_character_id INT,
    p_ability VARCHAR(3)
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH base AS (
        SELECT
            CASE upper(p_ability)
                WHEN 'STR' THEN c.strength
                WHEN 'DEX' THEN c.dexterity
                WHEN 'CON' THEN c.constitution
                WHEN 'INT' THEN c.intelligence
                WHEN 'WIS' THEN c.wisdom
                WHEN 'CHA' THEN c.charisma
                ELSE NULL
            END AS raw_score,
            private.ability_stat_name(p_ability) AS stat_name
        FROM characters c
        WHERE c.id = p_character_id
    ),
    option_mods AS (
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN COALESCE(ctom.max_value, 20) <= 20
                    THEN ctom.modifier_value
                    ELSE 0
                END
            ), 0) AS normal_bonus,
            COALESCE(SUM(
                CASE
                    WHEN COALESCE(ctom.max_value, 20) > 20
                    THEN ctom.modifier_value
                    ELSE 0
                END
            ), 0) AS epic_bonus,
            MAX(
                CASE
                    WHEN COALESCE(ctom.max_value, 20) > 20
                    THEN ctom.max_value
                    ELSE NULL
                END
            ) AS epic_cap
        FROM base b
        LEFT JOIN v_character_trait_option_modifiers ctom
            ON ctom.character_id = p_character_id
           AND ctom.affected_stat = b.stat_name
           AND ctom.operation = 'add'
    ),
    effect_mods AS (
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN sm.operation = 'add'
                    THEN COALESCE(sm.modifier_value, 0)
                    ELSE 0
                END
            ), 0) AS effect_bonus,
            MAX(
                CASE
                    WHEN sm.operation = 'set'
                    THEN sm.modifier_value
                    ELSE NULL
                END
            ) AS set_score
        FROM base b
        LEFT JOIN v_character_stat_modifiers sm
           ON sm.character_id = p_character_id
           AND sm.is_active
           AND COALESCE(sm.source_type, '') <> 'trait_option'
           AND sm.affected_stat = b.stat_name
           AND sm.operation IN ('add', 'set')
    ),
    permanent AS (
        SELECT
            CASE
                WHEN b.raw_score IS NULL THEN NULL
                ELSE LEAST(
                    COALESCE(o.epic_cap, 20),
                    LEAST(20, b.raw_score + o.normal_bonus) + o.epic_bonus
                )
            END AS score
        FROM base b
        CROSS JOIN option_mods o
    )
    SELECT CASE
        WHEN p.score IS NULL THEN NULL
        ELSE LEAST(
            30,
            GREATEST(
                p.score + e.effect_bonus,
                COALESCE(e.set_score, p.score + e.effect_bonus)
            )
        )
    END
    FROM permanent p
    CROSS JOIN effect_mods e;
$$;

CREATE OR REPLACE FUNCTION private.character_saving_throw_bonus(
    p_character_id INT,
    p_ability VARCHAR(3)
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT private.character_modifier_add_bonus(
        p_character_id,
        ARRAY[
            'all_saving_throws',
            private.ability_stat_name(p_ability) || '_saving_throw'
        ]
    );
$$;

CREATE OR REPLACE FUNCTION private.character_weapon_roll_bonus(
    p_character_id INT,
    p_weapon_name TEXT,
    p_weapon_category TEXT,
    p_roll_kind TEXT
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH stats AS (
        SELECT unnest(
            CASE
                WHEN p_roll_kind = 'attack'
                THEN ARRAY[
                    'weapon_attack_roll',
                    CASE
                        WHEN COALESCE(p_weapon_category, '') LIKE '%Ranged%'
                        THEN 'ranged_weapon_attack_roll'
                        ELSE NULL
                    END
                ]
                WHEN p_roll_kind = 'damage'
                THEN ARRAY['weapon_damage_roll']
                ELSE ARRAY[]::TEXT[]
            END
        ) AS affected_stat
    )
    SELECT COALESCE(SUM(COALESCE(sm.modifier_value, 0)), 0)::INT
    FROM v_character_stat_modifiers sm
    JOIN stats st ON st.affected_stat = sm.affected_stat
    WHERE sm.character_id = p_character_id
      AND sm.is_active
      AND sm.operation = 'add'
      AND st.affected_stat IS NOT NULL
      AND (
          COALESCE(sm.source_type, '') <> 'item'
          OR sm.source_name = p_weapon_name
      );
$$;

CREATE OR REPLACE FUNCTION private.character_spell_save_dc(
    p_character_id INT,
    p_base_dc INT
)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT GREATEST(
        p_base_dc,
        COALESCE(
            private.character_modifier_max_set(
                p_character_id,
                ARRAY['spell_saving_throw_dc']
            ),
            p_base_dc
        )
    );
$$;

CREATE OR REPLACE FUNCTION private.character_effective_max_hp(p_character_id INT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH base AS (
        SELECT c.max_hp, c.level
        FROM characters c
        WHERE c.id = p_character_id
    ),
    mods AS (
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN sm.affected_stat = 'max_hp'
                     AND sm.operation = 'add'
                    THEN COALESCE(sm.modifier_value, 0)
                    ELSE 0
                END
            ), 0) AS flat_bonus,
            COALESCE(SUM(
                CASE
                    WHEN sm.affected_stat = 'hp_max_per_level'
                     AND sm.operation = 'add'
                    THEN COALESCE(sm.modifier_value, 0)
                    ELSE 0
                END
            ), 0) AS per_level_bonus,
            MAX(
                CASE
                    WHEN sm.affected_stat = 'max_hp'
                     AND sm.operation = 'set'
                    THEN sm.modifier_value
                    ELSE NULL
                END
            ) AS set_max_hp
        FROM v_character_stat_modifiers sm
        WHERE sm.character_id = p_character_id
          AND sm.is_active
          AND sm.affected_stat IN ('max_hp', 'hp_max_per_level')
    )
    SELECT COALESCE(
        (
            SELECT GREATEST(
                1,
                COALESCE(mods.set_max_hp, base.max_hp)
                + mods.flat_bonus
                + (mods.per_level_bonus * base.level)
            )
            FROM base
            CROSS JOIN mods
        ),
        1
    );
$$;

CREATE OR REPLACE FUNCTION private.character_effective_armor_class(p_character_id INT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH ability_mods AS (
        SELECT
            private.ability_modifier(private.character_ability_score(p_character_id, 'DEX')) AS dex_mod,
            private.ability_modifier(private.character_ability_score(p_character_id, 'CON')) AS con_mod,
            private.ability_modifier(private.character_ability_score(p_character_id, 'WIS')) AS wis_mod,
            private.ability_modifier(private.character_ability_score(p_character_id, 'CHA')) AS cha_mod
    ),
    equipped AS (
        SELECT
            EXISTS (
                SELECT 1
                FROM v_character_inventory inv
                WHERE inv.character_id = p_character_id
                  AND inv.is_equipped
                  AND inv.item_type = 'Armor'
                  AND inv.armor_category <> 'Shield'
            ) AS has_armor,
            EXISTS (
                SELECT 1
                FROM v_character_inventory inv
                WHERE inv.character_id = p_character_id
                  AND inv.is_equipped
                  AND inv.item_type = 'Armor'
                  AND inv.armor_category = 'Shield'
            ) AS has_shield
    ),
    armor_ac AS (
        SELECT MAX(
            CASE
                WHEN inv.armor_category = 'Shield' THEN NULL
                WHEN inv.plus_dex_modifier THEN
                    inv.ac_bonus + LEAST(
                        am.dex_mod,
                        COALESCE(inv.max_dex_bonus, am.dex_mod)
                    )
                ELSE inv.ac_bonus
            END
        ) AS value
        FROM v_character_inventory inv
        CROSS JOIN ability_mods am
        WHERE inv.character_id = p_character_id
          AND inv.is_equipped
          AND inv.item_type = 'Armor'
    ),
    shield_ac AS (
        SELECT CASE
            WHEN EXISTS (
                SELECT 1
                FROM v_character_proficiency_details pd
                WHERE pd.character_id = p_character_id
                  AND pd.proficiency_type = 'armor'
                  AND lower(pd.name) = 'shields'
            )
            THEN COALESCE(MAX(inv.ac_bonus), 0)
            ELSE 0
        END AS value
        FROM v_character_inventory inv
        WHERE inv.character_id = p_character_id
          AND inv.is_equipped
          AND inv.item_type = 'Armor'
          AND inv.armor_category = 'Shield'
    ),
    unarmored_ac AS (
        SELECT MAX(value) AS value
        FROM (
            SELECT 10 + am.dex_mod AS value
            FROM ability_mods am

            UNION ALL

            SELECT 10 + am.dex_mod + am.con_mod
            FROM ability_mods am
            CROSS JOIN equipped eq
            WHERE NOT eq.has_armor
              AND EXISTS (
                  SELECT 1
                  FROM v_character_stat_modifiers sm
                  WHERE sm.character_id = p_character_id
                    AND sm.is_active
                    AND sm.effect_name = 'Barbarian: Unarmored Defense'
              )

            UNION ALL

            SELECT 10 + am.dex_mod + am.wis_mod
            FROM ability_mods am
            CROSS JOIN equipped eq
            WHERE NOT eq.has_armor
              AND NOT eq.has_shield
              AND EXISTS (
                  SELECT 1
                  FROM v_character_stat_modifiers sm
                  WHERE sm.character_id = p_character_id
                    AND sm.is_active
                    AND sm.effect_name = 'Monk: Unarmored Defense'
              )

            UNION ALL

            SELECT 10 + am.dex_mod + am.cha_mod
            FROM ability_mods am
            CROSS JOIN equipped eq
            WHERE NOT eq.has_armor
              AND NOT eq.has_shield
              AND EXISTS (
                  SELECT 1
                  FROM v_character_stat_modifiers sm
                  WHERE sm.character_id = p_character_id
                    AND sm.is_active
                    AND sm.effect_name = 'Bard (College of Dance): Dazzling Footwork'
              )

            UNION ALL

            SELECT 10 + am.dex_mod + am.cha_mod
            FROM ability_mods am
            CROSS JOIN equipped eq
            WHERE NOT eq.has_armor
              AND EXISTS (
                  SELECT 1
                  FROM v_character_stat_modifiers sm
                  WHERE sm.character_id = p_character_id
                    AND sm.is_active
                    AND sm.effect_name = 'Sorcerer (Draconic Sorcery): Draconic Resilience'
              )
        ) candidates
    ),
    base AS (
        SELECT GREATEST(
            c.armor_class,
            COALESCE(armor_ac.value, unarmored_ac.value)
        ) AS value
        FROM characters c
        CROSS JOIN armor_ac
        CROSS JOIN unarmored_ac
        WHERE c.id = p_character_id
    ),
    ac_mods AS (
        SELECT
            private.character_modifier_add_bonus(
                p_character_id,
                ARRAY['armor_class']
            ) AS always_bonus,
            CASE
                WHEN eq.has_armor
                THEN private.character_modifier_add_bonus(
                    p_character_id,
                    ARRAY['armor_class_when_wearing_armor']
                )
                ELSE 0
            END AS armor_bonus
        FROM equipped eq
    )
    SELECT COALESCE(
        (
            SELECT base.value + shield_ac.value + ac_mods.always_bonus + ac_mods.armor_bonus
            FROM base
            CROSS JOIN shield_ac
            CROSS JOIN ac_mods
        ),
        10
    );
$$;

CREATE OR REPLACE FUNCTION private.character_effective_speed(p_character_id INT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH base AS (
        SELECT c.id, c.speed
        FROM characters c
        WHERE c.id = p_character_id
    ),
    speed_mods AS (
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN sm.affected_stat = 'speed'
                     AND sm.operation = 'add'
                    THEN COALESCE(sm.modifier_value, 0)
                    ELSE 0
                END
            ), 0) AS add_bonus,
            MAX(
                CASE
                    WHEN sm.affected_stat = 'speed'
                     AND sm.operation = 'set'
                    THEN sm.modifier_value
                    ELSE NULL
                END
            ) AS set_speed
        FROM v_character_stat_modifiers sm
        WHERE sm.character_id = p_character_id
          AND sm.is_active
          AND sm.affected_stat = 'speed'
    ),
    armor_penalty AS (
        SELECT CASE
            WHEN EXISTS (
                SELECT 1
                FROM v_character_inventory inv
                CROSS JOIN base
                WHERE inv.character_id = base.id
                  AND inv.is_equipped
                  AND inv.item_type = 'Armor'
                  AND COALESCE(inv.min_strength, 0) > 0
                  AND private.character_ability_score(base.id, 'STR') < inv.min_strength
            )
            THEN 10
            ELSE 0
        END AS value
    )
    SELECT COALESCE(
        (
            SELECT GREATEST(
                0,
                GREATEST(base.speed, COALESCE(speed_mods.set_speed, base.speed))
                + speed_mods.add_bonus
                - armor_penalty.value
            )
            FROM base
            CROSS JOIN speed_mods
            CROSS JOIN armor_penalty
        ),
        0
    );
$$;

CREATE OR REPLACE VIEW v_character_proficiency_details
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
    NULL::TEXT AS notes,
    cp.tool_id,
    cp_tool.category AS tool_category,
    cp_tool.base_attribute AS tool_base_attribute
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
    ep.notes,
    ep.tool_id,
    tl.category AS tool_category,
    tl.base_attribute AS tool_base_attribute
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
    cto.trait_name || ': ' || cto.option_name AS notes,
    cto.option_tool_id AS tool_id,
    cto.option_tool_category AS tool_category,
    cto.option_tool_base_attribute AS tool_base_attribute
FROM v_character_trait_options cto
WHERE cto.option_skill_id IS NOT NULL
   OR cto.option_tool_id IS NOT NULL;

CREATE OR REPLACE VIEW v_character_summary
WITH (security_invoker = true) AS
SELECT
    c.id AS character_id,
    c.name,
    c.level,
    c.size,
    c.speed,
    c.current_hp,
    c.max_hp,
    private.character_effective_max_hp(c.id) AS effective_max_hp,
    c.temporary_hp,
    c.death_save_successes,
    c.death_save_failures,
    c.heroic_inspiration,
    c.armor_class,
    c.proficiency_bonus,
    s.name AS species_name,
    b.name AS background_name,
    c.starting_gold_gp,
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
    ) AS conditions,
    private.character_effective_armor_class(c.id) AS effective_armor_class,
    private.character_effective_speed(c.id) AS effective_speed
FROM characters c
LEFT JOIN species s ON s.id = c.species_id
LEFT JOIN backgrounds b ON b.id = c.background_id;

CREATE OR REPLACE FUNCTION public.get_character_sheet(p_character_id INT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    sheet JSONB;
BEGIN
    IF NOT private.can_access_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to access character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    WITH active AS (
        SELECT *
        FROM v_character_active_effects
        WHERE character_id = p_character_id
          AND is_active
    ),
    stat_mods AS (
        SELECT *
        FROM v_character_stat_modifiers
        WHERE character_id = p_character_id
    )
    SELECT jsonb_build_object(
        'summary', (
            SELECT to_jsonb(s)
            FROM v_character_summary s
            WHERE s.character_id = p_character_id
        ),
        'inventory', COALESCE((
            SELECT jsonb_agg(to_jsonb(inv) ORDER BY inv.is_equipped DESC, inv.name)
            FROM v_character_inventory inv
            WHERE inv.character_id = p_character_id
        ), '[]'::JSONB),
        'traits', COALESCE((
            SELECT jsonb_agg(to_jsonb(t) ORDER BY t.source_type, t.trait_name)
            FROM v_character_traits t
            WHERE t.character_id = p_character_id
        ), '[]'::JSONB),
        'proficiencies', COALESCE((
            SELECT jsonb_agg(to_jsonb(pd) ORDER BY pd.proficiency_type, pd.name)
            FROM v_character_proficiency_details pd
            WHERE pd.character_id = p_character_id
        ), '[]'::JSONB),
        'active_effects', COALESCE((
            SELECT jsonb_agg(to_jsonb(a) ORDER BY a.source_type, a.effect_name)
            FROM active a
        ), '[]'::JSONB),
        'stat_modifiers', COALESCE((
            SELECT jsonb_agg(to_jsonb(sm) ORDER BY sm.affected_stat, sm.source_name)
            FROM stat_mods sm
        ), '[]'::JSONB),
        'trait_options', COALESCE((
            SELECT jsonb_agg(to_jsonb(o) ORDER BY o.trait_name, o.option_group, o.selection_key)
            FROM v_character_trait_options o
            WHERE o.character_id = p_character_id
        ), '[]'::JSONB),
        'trait_spell_choices', COALESCE((
            SELECT jsonb_agg(to_jsonb(sc) ORDER BY sc.trait_name, sc.spell_level, sc.spell_name)
            FROM v_character_trait_spell_choices sc
            WHERE sc.character_id = p_character_id
        ), '[]'::JSONB)
    )
    INTO sheet;

    RETURN sheet;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_character_roll_context(p_character_id INT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    ctx JSONB;
BEGIN
    IF NOT private.can_access_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to access character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    SELECT jsonb_build_object(
        'character_id', c.id,
        'proficiency_bonus', c.proficiency_bonus,
        'armor_class', (
            SELECT s.effective_armor_class
            FROM v_character_summary s
            WHERE s.character_id = c.id
        ),
        'abilities', jsonb_build_object(
            'STR', jsonb_build_object('score', private.character_ability_score(c.id, 'STR'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'STR'))),
            'DEX', jsonb_build_object('score', private.character_ability_score(c.id, 'DEX'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'DEX'))),
            'CON', jsonb_build_object('score', private.character_ability_score(c.id, 'CON'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'CON'))),
            'INT', jsonb_build_object('score', private.character_ability_score(c.id, 'INT'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'INT'))),
            'WIS', jsonb_build_object('score', private.character_ability_score(c.id, 'WIS'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'WIS'))),
            'CHA', jsonb_build_object('score', private.character_ability_score(c.id, 'CHA'), 'modifier', private.ability_modifier(private.character_ability_score(c.id, 'CHA')))
        ),
        'saving_throws', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'ability', saves.ability,
                'modifier',
                    private.ability_modifier(private.character_ability_score(c.id, saves.ability))
                    + CASE WHEN cp.name IS NOT NULL THEN c.proficiency_bonus ELSE 0 END
                    + private.character_saving_throw_bonus(c.id, saves.ability),
                'proficient', cp.name IS NOT NULL
            ) ORDER BY saves.ability)
            FROM (VALUES ('STR'), ('DEX'), ('CON'), ('INT'), ('WIS'), ('CHA')) AS saves(ability)
            LEFT JOIN character_proficiencies cp
                ON cp.character_id = c.id
               AND cp.proficiency_type = 'save'
               AND cp.name = saves.ability
        ), '[]'::JSONB),
        'skills', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'skill', sk.name,
                'base_attribute', sk.base_attribute,
                'modifier',
                    private.ability_modifier(private.character_ability_score(c.id, sk.base_attribute))
                    + CASE WHEN cs.is_proficient THEN c.proficiency_bonus ELSE 0 END
                    + CASE WHEN cs.has_expertise THEN c.proficiency_bonus ELSE 0 END
                    + private.character_modifier_add_bonus(c.id, ARRAY['all_ability_checks']),
                'proficient', cs.is_proficient,
                'expertise', cs.has_expertise
            ) ORDER BY sk.name)
            FROM character_skills cs
            JOIN skills sk ON sk.id = cs.skill_id
            WHERE cs.character_id = c.id
        ), '[]'::JSONB),
        'spellcasting', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'class_id', cl.id,
                'class_name', cl.name,
                'class_level', cc.class_level,
                'spellcasting_ability', cs.spellcasting_ability,
                'prepared_count', skbl.knowledge_count,
                'spell_attack_bonus',
                    c.proficiency_bonus
                    + private.ability_modifier(private.character_ability_score(c.id, cs.spellcasting_ability))
                    + private.character_modifier_add_bonus(c.id, ARRAY['spell_attack_roll']),
                'spell_save_dc',
                    private.character_spell_save_dc(
                        c.id,
                        8 + c.proficiency_bonus
                        + private.ability_modifier(private.character_ability_score(c.id, cs.spellcasting_ability))
                    )
            ) ORDER BY cc.class_level DESC, cl.name)
            FROM character_classes cc
            JOIN classes cl ON cl.id = cc.class_id
            JOIN class_spellcasting cs ON cs.class_id = cc.class_id
            LEFT JOIN spell_knowledge_by_level skbl
                ON skbl.progression_slug = cs.prepared_progression_slug
               AND skbl.class_level = cc.class_level
            WHERE cc.character_id = c.id
        ), '[]'::JSONB),
        'weapons', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'item_id', weapon.item_id,
                'name', weapon.name,
                'is_equipped', weapon.is_equipped,
                'attack_ability', weapon.attack_ability,
                'attack_ability_options', private.weapon_attack_ability_options(
                    weapon.weapon_category,
                    weapon.weapon_properties
                ),
                'proficient', weapon.proficient,
                'attack_bonus',
                    private.ability_modifier(private.character_ability_score(c.id, weapon.attack_ability))
                    + CASE WHEN weapon.proficient THEN c.proficiency_bonus ELSE 0 END
                    + weapon.attack_roll_bonus,
                'damage_formula',
                    COALESCE(weapon.die_count::TEXT, '1') || COALESCE(weapon.damage_die, '')
                    || CASE
                        WHEN (
                            private.ability_modifier(private.character_ability_score(c.id, weapon.attack_ability))
                            + weapon.damage_roll_bonus
                        ) > 0
                        THEN '+' || (
                            private.ability_modifier(private.character_ability_score(c.id, weapon.attack_ability))
                            + weapon.damage_roll_bonus
                        )::TEXT
                        WHEN (
                            private.ability_modifier(private.character_ability_score(c.id, weapon.attack_ability))
                            + weapon.damage_roll_bonus
                        ) < 0
                        THEN (
                            private.ability_modifier(private.character_ability_score(c.id, weapon.attack_ability))
                            + weapon.damage_roll_bonus
                        )::TEXT
                        ELSE ''
                    END
                    || CASE
                        WHEN COALESCE(weapon.flat_bonus, 0) > 0 THEN '+' || weapon.flat_bonus::TEXT
                        WHEN COALESCE(weapon.flat_bonus, 0) < 0 THEN weapon.flat_bonus::TEXT
                        ELSE ''
                    END,
                'damage_type', weapon.damage_type,
                'properties', weapon.weapon_properties,
                'mastery_name', weapon.mastery_name
            ) ORDER BY weapon.is_equipped DESC, weapon.name)
            FROM (
                SELECT
                    inv.*,
                    private.character_weapon_attack_ability(
                        c.id,
                        inv.weapon_category,
                        inv.weapon_properties
                    ) AS attack_ability,
                    private.character_has_weapon_training(
                        c.id,
                        inv.name,
                        inv.weapon_category,
                        inv.weapon_properties
                    ) AS proficient,
                    private.character_weapon_roll_bonus(
                        c.id,
                        inv.name,
                        inv.weapon_category,
                        'attack'
                    ) AS attack_roll_bonus,
                    private.character_weapon_roll_bonus(
                        c.id,
                        inv.name,
                        inv.weapon_category,
                        'damage'
                    ) AS damage_roll_bonus
                FROM v_character_inventory inv
                WHERE inv.character_id = c.id
                  AND inv.item_type = 'Weapon'
            ) weapon
        ), '[]'::JSONB),
        'active_modifiers', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'affected_stat', sm.affected_stat,
                'operation', sm.operation,
                'modifier_value', sm.modifier_value,
                'source_name', sm.source_name
            ) ORDER BY sm.affected_stat, sm.source_name)
            FROM v_character_stat_modifiers sm
            WHERE sm.character_id = c.id
              AND sm.is_active
        ), '[]'::JSONB),
        'spell_slots', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'slot_level', css.slot_level,
                'max_slots', css.max_slots,
                'used_slots', css.used_slots,
                'remaining', css.max_slots - css.used_slots
            ) ORDER BY css.slot_level)
            FROM character_spell_slots css
            WHERE css.character_id = c.id
        ), '[]'::JSONB),
        'resources', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'trait_id', cr.trait_id,
                'resource_key', cr.resource_key,
                'name', cr.name,
                'max_uses', cr.max_uses,
                'used_uses', cr.used_uses,
                'remaining', cr.max_uses - cr.used_uses,
                'reset_on', cr.reset_on
            ) ORDER BY cr.name)
            FROM character_resources cr
            WHERE cr.character_id = c.id
        ), '[]'::JSONB)
    )
    INTO ctx
    FROM characters c
    WHERE c.id = p_character_id;

    IF ctx IS NULL THEN
        RAISE EXCEPTION 'Character % not found', p_character_id;
    END IF;

    RETURN ctx;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_character_hp(
    p_character_id INT,
    p_amount INT,
    p_hp_kind VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    row_before RECORD;
    row_after RECORD;
    effective_damage INT;
    effective_max_hp INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_hp_kind NOT IN ('damage', 'healing', 'temp_hp', 'set_temp_hp') THEN
        RAISE EXCEPTION 'Invalid hp_kind: %', p_hp_kind;
    END IF;

    SELECT
        c.current_hp,
        c.temporary_hp,
        private.character_effective_max_hp(c.id) AS max_hp
    INTO row_before
    FROM characters c
    WHERE c.id = p_character_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Character % not found', p_character_id;
    END IF;

    IF p_hp_kind = 'damage' THEN
        effective_damage := GREATEST(p_amount, 0);
        IF row_before.temporary_hp > 0 THEN
            IF row_before.temporary_hp >= effective_damage THEN
                UPDATE characters
                SET temporary_hp = temporary_hp - effective_damage
                WHERE id = p_character_id;
                effective_damage := 0;
            ELSE
                effective_damage := effective_damage - row_before.temporary_hp;
                UPDATE characters
                SET temporary_hp = 0
                WHERE id = p_character_id;
            END IF;
        END IF;

        IF effective_damage > 0 THEN
            UPDATE characters
            SET current_hp = GREATEST(current_hp - effective_damage, 0)
            WHERE id = p_character_id;
        END IF;

    ELSIF p_hp_kind = 'healing' THEN
        effective_max_hp := private.character_effective_max_hp(p_character_id);
        UPDATE characters
        SET current_hp = LEAST(current_hp + GREATEST(p_amount, 0), effective_max_hp)
        WHERE id = p_character_id;

    ELSIF p_hp_kind = 'temp_hp' THEN
        UPDATE characters
        SET temporary_hp = GREATEST(temporary_hp, GREATEST(p_amount, 0))
        WHERE id = p_character_id;

    ELSIF p_hp_kind = 'set_temp_hp' THEN
        UPDATE characters
        SET temporary_hp = GREATEST(p_amount, 0)
        WHERE id = p_character_id;
    END IF;

    SELECT
        c.current_hp,
        c.temporary_hp,
        private.character_effective_max_hp(c.id) AS max_hp
    INTO row_after
    FROM characters c
    WHERE c.id = p_character_id;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'hp_kind', p_hp_kind,
        'amount', p_amount,
        'before', jsonb_build_object(
            'current_hp', row_before.current_hp,
            'temporary_hp', row_before.temporary_hp,
            'max_hp', row_before.max_hp
        ),
        'after', jsonb_build_object(
            'current_hp', row_after.current_hp,
            'temporary_hp', row_after.temporary_hp,
            'max_hp', row_after.max_hp
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.take_long_rest(p_character_id INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    healed INT;
    effects_ended INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    UPDATE character_effects ce
    SET is_active = FALSE
    WHERE ce.character_id = p_character_id
      AND ce.is_active
      AND NOT private.effect_persists_after_long_rest(ce.effect_id, ce.timing_text);

    GET DIAGNOSTICS effects_ended = ROW_COUNT;

    UPDATE characters
    SET current_hp = private.character_effective_max_hp(p_character_id),
        temporary_hp = 0,
        death_save_successes = 0,
        death_save_failures = 0
    WHERE id = p_character_id;

    GET DIAGNOSTICS healed = ROW_COUNT;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'rest_type', 'long',
        'hp_restored_to_max', healed > 0,
        'temporary_hp_cleared', TRUE,
        'temporary_effects_ended', effects_ended,
        'spell_slots_restored', public.restore_spell_slots(p_character_id, 'long'),
        'resources_restored', public.restore_character_resources(p_character_id, 'long')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.level_up_character(
    p_character_id INT,
    p_class_id INT,
    p_new_class_level INT,
    p_subclass_id INT DEFAULT NULL,
    p_choices JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    current_class_level INT;
    current_total_level INT;
    next_total_level INT;
    opt_row JSONB;
    spell_row JSONB;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_new_class_level < 1 OR p_new_class_level > 20 THEN
        RAISE EXCEPTION 'class_level must be between 1 and 20';
    END IF;

    SELECT COALESCE(SUM(class_level), 0)
    INTO current_total_level
    FROM character_classes
    WHERE character_id = p_character_id;

    SELECT class_level
    INTO current_class_level
    FROM character_classes
    WHERE character_id = p_character_id
      AND class_id = p_class_id;

    IF current_class_level IS NULL THEN
        IF p_new_class_level <> 1 THEN
            RAISE EXCEPTION 'Multiclass entry must start at class_level 1';
        END IF;
        next_total_level := current_total_level + 1;
    ELSE
        IF p_new_class_level <= current_class_level THEN
            RAISE EXCEPTION 'new_class_level must be greater than current class_level';
        END IF;
        next_total_level := current_total_level - current_class_level + p_new_class_level;
    END IF;

    IF next_total_level > 20 THEN
        RAISE EXCEPTION 'total character level cannot exceed 20';
    END IF;

    IF current_class_level IS NULL THEN
        INSERT INTO character_classes (character_id, class_id, subclass_id, class_level)
        VALUES (p_character_id, p_class_id, p_subclass_id, 1);

        INSERT INTO character_proficiencies (
            character_id, proficiency_type, name, source_type, source_id
        )
        SELECT
            p_character_id,
            v.proficiency_type,
            v.name,
            'class',
            p_class_id
        FROM v_class_proficiency_details v
        WHERE v.class_id = p_class_id
          AND v.requires_choice = FALSE
        ON CONFLICT (character_id, proficiency_type, name) DO NOTHING;
    ELSE
        UPDATE character_classes
        SET class_level = p_new_class_level,
            subclass_id = COALESCE(p_subclass_id, subclass_id)
        WHERE character_id = p_character_id
          AND class_id = p_class_id;
    END IF;

    UPDATE characters
    SET level = next_total_level,
        proficiency_bonus = private.proficiency_bonus_for_level(next_total_level)
    WHERE id = p_character_id;

    FOR opt_row IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(p_choices->'trait_options', '[]'::JSONB))
    LOOP
        INSERT INTO character_trait_options (
            character_id, trait_id, option_group, selection_key,
            trait_option_id, source_type, source_id, notes
        )
        VALUES (
            p_character_id,
            (opt_row->>'trait_id')::INT,
            COALESCE(opt_row->>'option_group', 'default'),
            COALESCE(opt_row->>'selection_key', 'default'),
            (opt_row->>'trait_option_id')::INT,
            COALESCE(opt_row->>'source_type', 'level_up'),
            p_class_id,
            opt_row->>'notes'
        )
        ON CONFLICT (character_id, trait_id, option_group, selection_key) DO UPDATE
            SET trait_option_id = EXCLUDED.trait_option_id,
                notes = EXCLUDED.notes;
    END LOOP;

    FOR spell_row IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(p_choices->'trait_spell_choices', '[]'::JSONB))
    LOOP
        INSERT INTO character_trait_spell_choices (
            character_id, trait_id, choice_group, selection_key, spell_level,
            spell_id, trait_option_id, spell_list_id, source_type, source_id, notes
        )
        VALUES (
            p_character_id,
            (spell_row->>'trait_id')::INT,
            spell_row->>'choice_group',
            COALESCE(spell_row->>'selection_key', 'default'),
            (spell_row->>'spell_level')::INT,
            (spell_row->>'spell_id')::INT,
            NULLIF(spell_row->>'trait_option_id', '')::INT,
            NULLIF(spell_row->>'spell_list_id', '')::INT,
            COALESCE(spell_row->>'source_type', 'level_up'),
            p_class_id,
            spell_row->>'notes'
        )
        ON CONFLICT (character_id, trait_id, choice_group, selection_key) DO UPDATE
            SET spell_id = EXCLUDED.spell_id,
                spell_level = EXCLUDED.spell_level,
                notes = EXCLUDED.notes;
    END LOOP;

    PERFORM public.sync_character_spell_slots(p_character_id);
    PERFORM public.sync_character_resources(p_character_id);

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'class_id', p_class_id,
        'class_level', p_new_class_level,
        'total_level', next_total_level,
        'sheet', public.get_character_sheet(p_character_id)
    );
END;
$$;
