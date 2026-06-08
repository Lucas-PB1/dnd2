-- MAX(cc.class_level) com c.level solto viola GROUP BY no PostgreSQL.

CREATE OR REPLACE FUNCTION public.sync_character_spell_slots(p_character_id INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    primary_class_id INT;
    primary_class_level INT;
    upserted INT := 0;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    primary_class_id := private.primary_spellcasting_class_id(p_character_id);
    IF primary_class_id IS NULL THEN
        DELETE FROM character_spell_slots WHERE character_id = p_character_id;
        RETURN 0;
    END IF;

    SELECT COALESCE(
        (
            SELECT cc.class_level
            FROM character_classes cc
            WHERE cc.character_id = p_character_id
              AND cc.class_id = primary_class_id
        ),
        c.level
    )
    INTO primary_class_level
    FROM characters c
    WHERE c.id = p_character_id;

    INSERT INTO character_spell_slots (character_id, slot_level, max_slots, used_slots)
    SELECT
        p_character_id,
        v.slot_level,
        v.slot_count,
        COALESCE(css.used_slots, 0)
    FROM v_class_spell_slots v
    LEFT JOIN character_spell_slots css
        ON css.character_id = p_character_id
       AND css.slot_level = v.slot_level
    WHERE v.class_id = primary_class_id
      AND v.class_level = primary_class_level
      AND v.slot_count > 0
    ON CONFLICT (character_id, slot_level) DO UPDATE
        SET max_slots = EXCLUDED.max_slots,
            used_slots = LEAST(character_spell_slots.used_slots, EXCLUDED.max_slots);

    GET DIAGNOSTICS upserted = ROW_COUNT;

    DELETE FROM character_spell_slots css
    WHERE css.character_id = p_character_id
      AND NOT EXISTS (
          SELECT 1
          FROM v_class_spell_slots v
          WHERE v.class_id = primary_class_id
            AND v.class_level = primary_class_level
            AND v.slot_level = css.slot_level
            AND v.slot_count > 0
      );

    RETURN upserted;
END;
$$;

CREATE OR REPLACE FUNCTION private.trait_resource_max_uses(
    p_character_id INT,
    p_trait_id INT,
    p_resource_key VARCHAR
)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tr RECORD;
    class_level INT;
    ability_score INT;
    progression_count INT;
BEGIN
    SELECT tr.*
    INTO tr
    FROM trait_resources tr
    WHERE tr.trait_id = p_trait_id
      AND tr.resource_key = p_resource_key;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(
        (SELECT MAX(cc.class_level) FROM character_classes cc WHERE cc.character_id = p_character_id),
        c.level
    )
    INTO class_level
    FROM characters c
    WHERE c.id = p_character_id;

    CASE tr.count_type
        WHEN 'fixed' THEN
            RETURN tr.minimum_count;
        WHEN 'equals_level' THEN
            RETURN GREATEST(tr.minimum_count, class_level);
        WHEN 'by_level' THEN
            SELECT trp.resource_count
            INTO progression_count
            FROM trait_resource_progressions trp
            WHERE trp.trait_resource_id = tr.id
              AND trp.class_level = class_level;

            RETURN COALESCE(progression_count, tr.minimum_count);
        WHEN 'ability_modifier' THEN
            ability_score := private.character_ability_score(p_character_id, tr.ability);
            RETURN GREATEST(tr.minimum_count, private.ability_modifier(ability_score));
        ELSE
            RETURN tr.minimum_count;
    END CASE;
END;
$$;
