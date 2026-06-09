-- Apply persisted trait option ability modifiers to derived ability lookups.

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
            CASE upper(p_ability)
                WHEN 'STR' THEN 'strength'
                WHEN 'DEX' THEN 'dexterity'
                WHEN 'CON' THEN 'constitution'
                WHEN 'INT' THEN 'intelligence'
                WHEN 'WIS' THEN 'wisdom'
                WHEN 'CHA' THEN 'charisma'
                ELSE NULL
            END AS stat_name
        FROM characters c
        WHERE c.id = p_character_id
    ),
    modifiers AS (
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
    )
    SELECT
        CASE
            WHEN b.raw_score IS NULL THEN NULL
            ELSE LEAST(
                COALESCE(m.epic_cap, 20),
                LEAST(20, b.raw_score + m.normal_bonus) + m.epic_bonus
            )
        END
    FROM base b
    CROSS JOIN modifiers m;
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
        'armor_class', c.armor_class,
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
                    + CASE WHEN cp.name IS NOT NULL THEN c.proficiency_bonus ELSE 0 END,
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
                    + CASE WHEN cs.has_expertise THEN c.proficiency_bonus ELSE 0 END,
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
                'spell_attack_bonus',
                    c.proficiency_bonus
                    + private.ability_modifier(private.character_ability_score(c.id, cs.spellcasting_ability)),
                'spell_save_dc',
                    8 + c.proficiency_bonus
                    + private.ability_modifier(private.character_ability_score(c.id, cs.spellcasting_ability))
            ) ORDER BY cc.class_level DESC, cl.name)
            FROM character_classes cc
            JOIN classes cl ON cl.id = cc.class_id
            JOIN class_spellcasting cs ON cs.class_id = cc.class_id
            WHERE cc.character_id = c.id
        ), '[]'::JSONB),
        'weapons', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'item_id', inv.item_id,
                'name', inv.name,
                'is_equipped', inv.is_equipped,
                'attack_ability', CASE
                    WHEN inv.weapon_category LIKE '%Melee%' THEN 'STR'
                    ELSE 'DEX'
                END,
                'attack_bonus',
                    private.ability_modifier(private.character_ability_score(
                        c.id,
                        CASE
                            WHEN inv.weapon_category LIKE '%Melee%' THEN 'STR'
                            ELSE 'DEX'
                        END
                    ))
                    + CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM character_proficiencies cp
                            WHERE cp.character_id = c.id
                              AND cp.proficiency_type = 'weapon'
                              AND cp.name = inv.name
                        ) THEN c.proficiency_bonus
                        ELSE 0
                    END,
                'damage_formula',
                    COALESCE(inv.die_count::TEXT, '1') || COALESCE(inv.damage_die, '')
                    || CASE
                        WHEN private.ability_modifier(private.character_ability_score(
                            c.id,
                            CASE
                                WHEN inv.weapon_category LIKE '%Melee%' THEN 'STR'
                                ELSE 'DEX'
                            END
                        )) >= 0
                        THEN '+' || private.ability_modifier(private.character_ability_score(
                            c.id,
                            CASE
                                WHEN inv.weapon_category LIKE '%Melee%' THEN 'STR'
                                ELSE 'DEX'
                            END
                        ))::TEXT
                        ELSE private.ability_modifier(private.character_ability_score(
                            c.id,
                            CASE
                                WHEN inv.weapon_category LIKE '%Melee%' THEN 'STR'
                                ELSE 'DEX'
                            END
                        ))::TEXT
                    END
                    || CASE WHEN COALESCE(inv.flat_bonus, 0) <> 0 THEN '+' || inv.flat_bonus::TEXT ELSE '' END,
                'damage_type', inv.damage_type,
                'properties', inv.weapon_properties
            ) ORDER BY inv.is_equipped DESC, inv.name)
            FROM v_character_inventory inv
            WHERE inv.character_id = c.id
              AND inv.item_type = 'Weapon'
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
