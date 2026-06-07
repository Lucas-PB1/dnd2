-- Migration: 000010 — RPCs e helpers
-- ==========================================
-- RPCs E HELPERS
-- ==========================================

CREATE OR REPLACE FUNCTION private.clear_attunement_when_unequipped()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.is_equipped = TRUE AND NEW.is_equipped = FALSE THEN
        NEW.is_attuned = FALSE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.enforce_attunement_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    attuned_count INT;
    item_requires_attunement BOOLEAN;
BEGIN
    IF NOT NEW.is_attuned THEN
        RETURN NEW;
    END IF;

    SELECT i.requires_attunement
    INTO item_requires_attunement
    FROM items i
    WHERE i.id = NEW.item_id;

    IF NOT COALESCE(item_requires_attunement, FALSE) THEN
        RAISE EXCEPTION 'Item % does not require attunement', NEW.item_id;
    END IF;

    SELECT COUNT(*)
    INTO attuned_count
    FROM inventory inv
    WHERE inv.character_id = NEW.character_id
      AND inv.is_attuned = TRUE
      AND inv.item_id <> NEW.item_id;

    IF attuned_count >= 3 THEN
        RAISE EXCEPTION 'A character can attune to at most 3 magic items';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inventory_clear_attunement
    BEFORE UPDATE OF is_equipped ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION private.clear_attunement_when_unequipped();

CREATE TRIGGER trg_inventory_enforce_attunement
    BEFORE INSERT OR UPDATE OF is_attuned ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION private.enforce_attunement_rules();

CREATE OR REPLACE FUNCTION public.set_inventory_equipped(
    p_character_id INT,
    p_item_id INT,
    p_is_equipped BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id;
    END IF;

    UPDATE inventory
    SET is_equipped = p_is_equipped
    WHERE character_id = p_character_id
      AND item_id = p_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item % not found in inventory for character %', p_item_id, p_character_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_inventory_attuned(
    p_character_id INT,
    p_item_id INT,
    p_is_attuned BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id;
    END IF;

    UPDATE inventory
    SET is_attuned = p_is_attuned
    WHERE character_id = p_character_id
      AND item_id = p_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item % not found in inventory for character %', p_item_id, p_character_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_inventory_item(
    p_character_id INT,
    p_item_id INT
)
RETURNS INT[]
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    item_consumable BOOLEAN;
    current_quantity INT;
    effect_row RECORD;
    inserted_ids INT[] := ARRAY[]::INT[];
    new_effect_id INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id;
    END IF;

    SELECT i.is_consumable, inv.quantity
    INTO item_consumable, current_quantity
    FROM inventory inv
    JOIN items i ON i.id = inv.item_id
    WHERE inv.character_id = p_character_id
      AND inv.item_id = p_item_id
    FOR UPDATE OF inv;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item % not found in inventory for character %', p_item_id, p_character_id;
    END IF;

    IF NOT item_consumable THEN
        RAISE EXCEPTION 'Item % is not consumable', p_item_id;
    END IF;

    FOR effect_row IN
        SELECT e.id AS effect_id, e.duration_text
        FROM item_traits it
        JOIN effects e ON e.trait_id = it.trait_id
        WHERE it.item_id = p_item_id
        ORDER BY e.id
    LOOP
        INSERT INTO character_effects (
            character_id,
            effect_id,
            source_type,
            source_id,
            is_active,
            timing_text
        )
        VALUES (
            p_character_id,
            effect_row.effect_id,
            'item',
            p_item_id,
            TRUE,
            effect_row.duration_text
        )
        RETURNING id INTO new_effect_id;

        inserted_ids := array_append(inserted_ids, new_effect_id);
    END LOOP;

    IF COALESCE(array_length(inserted_ids, 1), 0) = 0 THEN
        RAISE EXCEPTION 'Item % has no consumable effects configured', p_item_id;
    END IF;

    IF current_quantity <= 1 THEN
        DELETE FROM inventory
        WHERE character_id = p_character_id
          AND item_id = p_item_id;
    ELSE
        UPDATE inventory
        SET quantity = quantity - 1
        WHERE character_id = p_character_id
          AND item_id = p_item_id;
    END IF;

    RETURN inserted_ids;
END;
$$;

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
        SELECT
            a.character_id,
            a.source_type,
            a.source_name,
            a.trait_id,
            a.trait_name,
            a.effect_id,
            a.effect_name,
            a.character_effect_id,
            a.is_active,
            em.affected_stat,
            em.operation,
            em.modifier_value
        FROM active a
        JOIN effect_modifiers em ON em.effect_id = a.effect_id

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
        FROM v_character_trait_option_modifiers ctom
        WHERE ctom.character_id = p_character_id
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

COMMENT ON FUNCTION public.get_character_sheet IS
    'Ficha completa em um JSONB: summary, inventory, traits, active_effects, stat_modifiers, trait_options, trait_spell_choices.';

CREATE OR REPLACE FUNCTION private.ability_modifier(p_score INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT FLOOR((p_score - 10) / 2.0)::INT;
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
    SELECT CASE upper(p_ability)
        WHEN 'STR' THEN c.strength
        WHEN 'DEX' THEN c.dexterity
        WHEN 'CON' THEN c.constitution
        WHEN 'INT' THEN c.intelligence
        WHEN 'WIS' THEN c.wisdom
        WHEN 'CHA' THEN c.charisma
        ELSE NULL
    END
    FROM characters c
    WHERE c.id = p_character_id;
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

    SELECT COALESCE(MAX(cc.class_level), c.level)
    INTO class_level
    FROM characters c
    LEFT JOIN character_classes cc ON cc.character_id = c.id
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

CREATE OR REPLACE FUNCTION private.primary_spellcasting_class_id(p_character_id INT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT cc.class_id
    FROM character_classes cc
    JOIN class_spellcasting cs ON cs.class_id = cc.class_id
    WHERE cc.character_id = p_character_id
    ORDER BY cc.class_level DESC, cc.class_id
    LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- HP
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.adjust_character_hp(
    p_character_id INT,
    p_amount INT,
    p_hp_kind VARCHAR DEFAULT 'damage'
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
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_hp_kind NOT IN ('damage', 'healing', 'temp_hp', 'set_temp_hp') THEN
        RAISE EXCEPTION 'Invalid hp_kind: %', p_hp_kind;
    END IF;

    SELECT current_hp, temporary_hp, max_hp
    INTO row_before
    FROM characters
    WHERE id = p_character_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Character % not found', p_character_id;
    END IF;

    IF p_hp_kind = 'damage' THEN
        effective_damage := p_amount;
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
        UPDATE characters
        SET current_hp = LEAST(current_hp + p_amount, max_hp)
        WHERE id = p_character_id;

    ELSIF p_hp_kind = 'temp_hp' THEN
        UPDATE characters
        SET temporary_hp = temporary_hp + GREATEST(p_amount, 0)
        WHERE id = p_character_id;

    ELSIF p_hp_kind = 'set_temp_hp' THEN
        UPDATE characters
        SET temporary_hp = GREATEST(p_amount, 0)
        WHERE id = p_character_id;
    END IF;

    SELECT current_hp, temporary_hp, max_hp
    INTO row_after
    FROM characters
    WHERE id = p_character_id;

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

-- ---------------------------------------------------------------------------
-- Spell slots
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_character_spell_slots(p_character_id INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    class_id INT;
    class_level INT;
    upserted INT := 0;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    class_id := private.primary_spellcasting_class_id(p_character_id);
    IF class_id IS NULL THEN
        DELETE FROM character_spell_slots WHERE character_id = p_character_id;
        RETURN 0;
    END IF;

    SELECT COALESCE(MAX(cc.class_level), c.level)
    INTO class_level
    FROM characters c
    LEFT JOIN character_classes cc
        ON cc.character_id = c.id
       AND cc.class_id = class_id
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
    WHERE v.class_id = class_id
      AND v.class_level = class_level
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
          WHERE v.class_id = class_id
            AND v.class_level = class_level
            AND v.slot_level = css.slot_level
            AND v.slot_count > 0
      );

    RETURN upserted;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_spell_slot(
    p_character_id INT,
    p_slot_level INT,
    p_count INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    row_after RECORD;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_count <= 0 THEN
        RAISE EXCEPTION 'count must be positive';
    END IF;

    UPDATE character_spell_slots
    SET used_slots = used_slots + p_count
    WHERE character_id = p_character_id
      AND slot_level = p_slot_level
      AND used_slots + p_count <= max_slots;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient spell slots at level %', p_slot_level;
    END IF;

    SELECT slot_level, max_slots, used_slots
    INTO row_after
    FROM character_spell_slots
    WHERE character_id = p_character_id
      AND slot_level = p_slot_level;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'slot_level', row_after.slot_level,
        'max_slots', row_after.max_slots,
        'used_slots', row_after.used_slots,
        'remaining', row_after.max_slots - row_after.used_slots
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_spell_slots(
    p_character_id INT,
    p_rest_type VARCHAR DEFAULT 'long'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    restored INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_rest_type NOT IN ('short', 'long', 'all') THEN
        RAISE EXCEPTION 'Invalid rest_type: %', p_rest_type;
    END IF;

    IF p_rest_type = 'short' THEN
        UPDATE character_spell_slots css
        SET used_slots = GREATEST(used_slots - 1, 0)
        FROM class_spellcasting cs
        JOIN spellcasting_progressions sp ON sp.id = cs.progression_id
        WHERE css.character_id = p_character_id
          AND cs.class_id = private.primary_spellcasting_class_id(p_character_id)
          AND sp.slot_recovery = 'Short Rest'
          AND css.used_slots > 0;
    ELSE
        UPDATE character_spell_slots
        SET used_slots = 0
        WHERE character_id = p_character_id;
    END IF;

    GET DIAGNOSTICS restored = ROW_COUNT;
    RETURN restored;
END;
$$;

-- ---------------------------------------------------------------------------
-- Resources (cargas, Rage, Ki…)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_character_resources(p_character_id INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    upserted INT := 0;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO character_resources (
        character_id,
        trait_id,
        resource_key,
        name,
        max_uses,
        used_uses,
        reset_on,
        source_type,
        source_id
    )
    SELECT
        ct.character_id,
        tr.trait_id,
        tr.resource_key,
        ct.trait_name || ' — ' || tr.resource_name,
        private.trait_resource_max_uses(p_character_id, tr.trait_id, tr.resource_key),
        COALESCE(cr.used_uses, 0),
        CASE
            WHEN tr.reset_on = 'Short and Long Rest' THEN 'Short Rest'
            ELSE tr.reset_on
        END,
        ct.source_type,
        NULL::INT
    FROM v_character_traits ct
    JOIN trait_resources tr ON tr.trait_id = ct.trait_id
    LEFT JOIN character_resources cr
        ON cr.character_id = ct.character_id
       AND cr.trait_id = tr.trait_id
       AND cr.resource_key = tr.resource_key
    WHERE ct.character_id = p_character_id
      AND private.trait_resource_max_uses(p_character_id, tr.trait_id, tr.resource_key) IS NOT NULL
    ON CONFLICT (character_id, trait_id, resource_key)
        WHERE trait_id IS NOT NULL AND resource_key IS NOT NULL
    DO UPDATE
        SET max_uses = EXCLUDED.max_uses,
            used_uses = LEAST(character_resources.used_uses, EXCLUDED.max_uses),
            name = EXCLUDED.name,
            reset_on = EXCLUDED.reset_on,
            source_type = EXCLUDED.source_type;

    GET DIAGNOSTICS upserted = ROW_COUNT;

    DELETE FROM character_resources cr
    WHERE cr.character_id = p_character_id
      AND cr.trait_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1
          FROM v_character_traits ct
          JOIN trait_resources tr ON tr.trait_id = ct.trait_id
          WHERE ct.character_id = p_character_id
            AND tr.trait_id = cr.trait_id
            AND tr.resource_key = cr.resource_key
      );

    RETURN upserted;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_character_resource(
    p_character_id INT,
    p_trait_id INT,
    p_resource_key VARCHAR,
    p_amount INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    row_after RECORD;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'amount must be positive';
    END IF;

    UPDATE character_resources
    SET used_uses = used_uses + p_amount
    WHERE character_id = p_character_id
      AND trait_id = p_trait_id
      AND resource_key = p_resource_key
      AND used_uses + p_amount <= max_uses;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient resource % for trait %', p_resource_key, p_trait_id;
    END IF;

    SELECT name, max_uses, used_uses
    INTO row_after
    FROM character_resources
    WHERE character_id = p_character_id
      AND trait_id = p_trait_id
      AND resource_key = p_resource_key;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'trait_id', p_trait_id,
        'resource_key', p_resource_key,
        'name', row_after.name,
        'max_uses', row_after.max_uses,
        'used_uses', row_after.used_uses,
        'remaining', row_after.max_uses - row_after.used_uses
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_trait_spell_charge(
    p_character_id INT,
    p_trait_id INT,
    p_spell_id INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    charge_cost INT;
    resource_key VARCHAR;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    SELECT ts.charge_cost
    INTO charge_cost
    FROM trait_spells ts
    WHERE ts.trait_id = p_trait_id
      AND ts.spell_id = p_spell_id;

    IF NOT FOUND OR charge_cost IS NULL THEN
        RAISE EXCEPTION 'Spell % on trait % has no charge_cost', p_spell_id, p_trait_id;
    END IF;

    SELECT tr.resource_key
    INTO resource_key
    FROM trait_resources tr
    WHERE tr.trait_id = p_trait_id
      AND tr.resource_key IN ('item-spell-charges', 'item-enspelled-charges', 'item-charges')
    ORDER BY CASE tr.resource_key
        WHEN 'item-spell-charges' THEN 1
        WHEN 'item-enspelled-charges' THEN 2
        ELSE 3
    END
    LIMIT 1;

    IF resource_key IS NULL THEN
        RAISE EXCEPTION 'Trait % has no charge pool configured', p_trait_id;
    END IF;

    RETURN public.spend_character_resource(
        p_character_id,
        p_trait_id,
        resource_key,
        charge_cost
    ) || jsonb_build_object('spell_id', p_spell_id, 'charge_cost', charge_cost);
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_character_resources(
    p_character_id INT,
    p_rest_type VARCHAR DEFAULT 'long'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    restored INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    IF p_rest_type NOT IN ('short', 'long', 'dawn') THEN
        RAISE EXCEPTION 'Invalid rest_type: %', p_rest_type;
    END IF;

    UPDATE character_resources cr
    SET used_uses = CASE
        WHEN p_rest_type = 'short' AND tr.short_rest_recovery = 'all' THEN 0
        WHEN p_rest_type = 'short' AND tr.short_rest_recovery = 'one' THEN GREATEST(cr.used_uses - 1, 0)
        WHEN p_rest_type = 'long' AND tr.long_rest_recovery = 'all' THEN 0
        WHEN p_rest_type = 'long' AND tr.long_rest_recovery = 'one' THEN GREATEST(cr.used_uses - 1, 0)
        WHEN p_rest_type = 'long' AND cr.reset_on = 'Long Rest' THEN 0
        WHEN p_rest_type = 'short' AND cr.reset_on = 'Short Rest' THEN 0
        WHEN p_rest_type = 'dawn' AND cr.reset_on = 'Dawn' THEN 0
        ELSE cr.used_uses
    END
    FROM trait_resources tr
    WHERE cr.character_id = p_character_id
      AND cr.trait_id = tr.trait_id
      AND cr.resource_key = tr.resource_key
      AND (
          (p_rest_type = 'short' AND (
              tr.short_rest_recovery IN ('all', 'one')
              OR cr.reset_on = 'Short Rest'
              OR tr.reset_on = 'Short and Long Rest'
          ))
          OR (p_rest_type = 'long' AND (
              tr.long_rest_recovery IN ('all', 'one')
              OR cr.reset_on = 'Long Rest'
              OR tr.reset_on = 'Short and Long Rest'
          ))
          OR (p_rest_type = 'dawn' AND cr.reset_on = 'Dawn')
      );

    GET DIAGNOSTICS restored = ROW_COUNT;
    RETURN restored;
END;
$$;

-- ---------------------------------------------------------------------------
-- Roll context (read-only — app rola d20 e aplica manualmente)
-- ---------------------------------------------------------------------------

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
            'STR', jsonb_build_object('score', c.strength, 'modifier', private.ability_modifier(c.strength)),
            'DEX', jsonb_build_object('score', c.dexterity, 'modifier', private.ability_modifier(c.dexterity)),
            'CON', jsonb_build_object('score', c.constitution, 'modifier', private.ability_modifier(c.constitution)),
            'INT', jsonb_build_object('score', c.intelligence, 'modifier', private.ability_modifier(c.intelligence)),
            'WIS', jsonb_build_object('score', c.wisdom, 'modifier', private.ability_modifier(c.wisdom)),
            'CHA', jsonb_build_object('score', c.charisma, 'modifier', private.ability_modifier(c.charisma))
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

COMMENT ON FUNCTION public.adjust_character_hp IS
    'Aplica dano, cura ou HP temporário. Retorna before/after; não resolve morte automaticamente.';

COMMENT ON FUNCTION public.get_character_roll_context IS
    'Contexto de rolagem (CD, ataque, perícias, armas). App rola d20 e aplica resultado manualmente.';

COMMENT ON FUNCTION public.spend_trait_spell_charge IS
    'Gasta cargas de item ao conjurar magia de trait_spells com charge_cost.';

CREATE OR REPLACE FUNCTION public.take_short_rest(p_character_id INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'rest_type', 'short',
        'spell_slots_restored', public.restore_spell_slots(p_character_id, 'short'),
        'resources_restored', public.restore_character_resources(p_character_id, 'short')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.set_character_condition(
    p_character_id INT,
    p_status_name VARCHAR,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_timing_text VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    status_id INT;
BEGIN
    IF NOT private.can_edit_character(p_character_id) THEN
        RAISE EXCEPTION 'Not allowed to edit character %', p_character_id
            USING ERRCODE = '42501';
    END IF;

    SELECT id INTO status_id FROM statuses WHERE name = p_status_name;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unknown status: %', p_status_name;
    END IF;

    IF p_is_active THEN
        INSERT INTO character_conditions (
            character_id, status_id, is_active, timing_text, notes
        )
        VALUES (
            p_character_id, status_id, TRUE, p_timing_text, p_notes
        )
        ON CONFLICT (character_id, status_id) DO UPDATE
            SET is_active = TRUE,
                timing_text = COALESCE(EXCLUDED.timing_text, character_conditions.timing_text),
                notes = COALESCE(EXCLUDED.notes, character_conditions.notes);
    ELSE
        UPDATE character_conditions
        SET is_active = FALSE
        WHERE character_id = p_character_id
          AND status_id = status_id;
    END IF;

    RETURN jsonb_build_object(
        'character_id', p_character_id,
        'status', p_status_name,
        'is_active', p_is_active
    );
END;
$$;

CREATE OR REPLACE FUNCTION private.proficiency_bonus_for_level(p_level INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT LEAST(6, GREATEST(2, 2 + ((GREATEST(p_level, 1) - 1) / 4)));
$$;

CREATE OR REPLACE FUNCTION private.effect_persists_after_long_rest(
    p_effect_id INT,
    p_timing_text TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    catalog_duration TEXT;
BEGIN
    SELECT e.duration_text
    INTO catalog_duration
    FROM effects e
    WHERE e.id = p_effect_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Passivo permanente: sem duração no catálogo e sem timing de sessão.
    IF catalog_duration IS NULL
       AND (p_timing_text IS NULL OR btrim(p_timing_text) = '') THEN
        RETURN TRUE;
    END IF;

    -- Qualquer duração (1 hour, 10 minutes, until Long Rest…) acaba no Long Rest.
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION private.character_total_level(p_character_id INT)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(cc.class_level), 0)::INT
    FROM character_classes cc
    WHERE cc.character_id = p_character_id;
$$;

-- ---------------------------------------------------------------------------
-- Long rest — quebra efeitos temporários; mantém passivos
-- ---------------------------------------------------------------------------

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

    UPDATE characters
    SET current_hp = max_hp,
        temporary_hp = 0,
        death_save_successes = 0,
        death_save_failures = 0
    WHERE id = p_character_id;

    GET DIAGNOSTICS healed = ROW_COUNT;

    UPDATE character_effects ce
    SET is_active = FALSE
    WHERE ce.character_id = p_character_id
      AND ce.is_active
      AND NOT private.effect_persists_after_long_rest(ce.effect_id, ce.timing_text);

    GET DIAGNOSTICS effects_ended = ROW_COUNT;

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

COMMENT ON FUNCTION private.effect_persists_after_long_rest IS
    'TRUE só para efeitos passivos (sem duration_text). Timed effects acabam no Long Rest.';

-- ---------------------------------------------------------------------------
-- create_character
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    new_id INT;
    owner_id UUID;
    species_id INT;
    background_id INT;
    total_level INT := 0;
    class_row JSONB;
    class_id INT;
    class_level INT;
BEGIN
    owner_id := auth.uid();
    IF owner_id IS NULL THEN
        RAISE EXCEPTION 'Authenticated player required'
            USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM players WHERE id = owner_id) THEN
        RAISE EXCEPTION 'Player profile required for %', owner_id;
    END IF;

    IF p_payload->>'name' IS NULL OR btrim(p_payload->>'name') = '' THEN
        RAISE EXCEPTION 'name is required';
    END IF;

    species_id := (p_payload->>'species_id')::INT;
    background_id := (p_payload->>'background_id')::INT;

    IF species_id IS NULL OR background_id IS NULL THEN
        RAISE EXCEPTION 'species_id and background_id are required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM species WHERE id = species_id) THEN
        RAISE EXCEPTION 'Unknown species_id %', species_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM backgrounds WHERE id = background_id) THEN
        RAISE EXCEPTION 'Unknown background_id %', background_id;
    END IF;

    IF p_payload->'classes' IS NULL
       OR jsonb_array_length(p_payload->'classes') = 0 THEN
        RAISE EXCEPTION 'classes array is required';
    END IF;

    FOR class_row IN SELECT value FROM jsonb_array_elements(p_payload->'classes')
    LOOP
        total_level := total_level + COALESCE((class_row->>'class_level')::INT, 1);
    END LOOP;

    INSERT INTO characters (
        owner_player_id,
        species_id,
        background_id,
        name,
        level,
        size,
        speed,
        max_hp,
        current_hp,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        proficiency_bonus,
        armor_class
    )
    SELECT
        owner_id,
        species_id,
        background_id,
        btrim(p_payload->>'name'),
        total_level,
        COALESCE(p_payload->>'size', split_part(s.size_options, '/', 1), 'Medium'),
        COALESCE((p_payload->>'speed')::INT, s.base_speed, 30),
        COALESCE((p_payload->>'max_hp')::INT, 1),
        COALESCE((p_payload->>'current_hp')::INT, (p_payload->>'max_hp')::INT, 1),
        COALESCE((p_payload->'abilities'->>'STR')::INT, 10),
        COALESCE((p_payload->'abilities'->>'DEX')::INT, 10),
        COALESCE((p_payload->'abilities'->>'CON')::INT, 10),
        COALESCE((p_payload->'abilities'->>'INT')::INT, 10),
        COALESCE((p_payload->'abilities'->>'WIS')::INT, 10),
        COALESCE((p_payload->'abilities'->>'CHA')::INT, 10),
        private.proficiency_bonus_for_level(total_level),
        COALESCE((p_payload->>'armor_class')::INT, 10)
    FROM species s
    WHERE s.id = species_id
    RETURNING id INTO new_id;

    FOR class_row IN SELECT value FROM jsonb_array_elements(p_payload->'classes')
    LOOP
        class_id := (class_row->>'class_id')::INT;
        class_level := COALESCE((class_row->>'class_level')::INT, 1);

        IF NOT EXISTS (SELECT 1 FROM classes WHERE id = class_id) THEN
            RAISE EXCEPTION 'Unknown class_id %', class_id;
        END IF;

        INSERT INTO character_classes (character_id, class_id, subclass_id, class_level)
        VALUES (
            new_id,
            class_id,
            NULLIF(class_row->>'subclass_id', '')::INT,
            class_level
        );

        INSERT INTO character_proficiencies (
            character_id, proficiency_type, name, source_type, source_id
        )
        SELECT
            new_id,
            v.proficiency_type,
            v.name,
            'class',
            class_id
        FROM v_class_proficiency_details v
        WHERE v.class_id = class_id
          AND v.requires_choice = FALSE
        ON CONFLICT (character_id, proficiency_type, name) DO NOTHING;
    END LOOP;

    INSERT INTO character_proficiencies (character_id, proficiency_type, name, source_type, source_id)
    SELECT new_id, 'skill', sk.name, 'background', background_id
    FROM background_skill_proficiencies bsp
    JOIN skills sk ON sk.id = bsp.skill_id
    WHERE bsp.background_id = background_id
    ON CONFLICT (character_id, proficiency_type, name) DO NOTHING;

    INSERT INTO character_feats (character_id, feat_id, source_type, source_id, selection_key)
    SELECT
        new_id,
        b.origin_feat_id,
        'background',
        background_id,
        b.origin_feat_selection_key
    FROM backgrounds b
    WHERE b.id = background_id
      AND b.origin_feat_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1
          FROM character_feats cf
          WHERE cf.character_id = new_id
            AND cf.feat_id = b.origin_feat_id
            AND COALESCE(cf.selection_key, '') = COALESCE(b.origin_feat_selection_key, '')
      );

    INSERT INTO character_skills (character_id, skill_id, is_proficient, has_expertise)
    SELECT
        new_id,
        (skill_row->>'skill_id')::INT,
        COALESCE((skill_row->>'is_proficient')::BOOLEAN, TRUE),
        COALESCE((skill_row->>'has_expertise')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(COALESCE(p_payload->'skills', '[]'::JSONB)) AS skill_row
    WHERE skill_row->>'skill_id' IS NOT NULL
    ON CONFLICT (character_id, skill_id) DO UPDATE
        SET is_proficient = EXCLUDED.is_proficient,
            has_expertise = EXCLUDED.has_expertise;

    INSERT INTO character_proficiencies (
        character_id, proficiency_type, tool_id, name, source_type, source_id
    )
    SELECT
        new_id,
        prof_row->>'proficiency_type',
        NULLIF(prof_row->>'tool_id', '')::INT,
        prof_row->>'name',
        COALESCE(prof_row->>'source_type', 'player'),
        NULLIF(prof_row->>'source_id', '')::INT
    FROM jsonb_array_elements(COALESCE(p_payload->'proficiencies', '[]'::JSONB)) AS prof_row
    WHERE prof_row->>'name' IS NOT NULL
    ON CONFLICT (character_id, proficiency_type, name) DO NOTHING;

    INSERT INTO character_feats (character_id, feat_id, source_type, source_id, selection_key, notes)
    SELECT
        new_id,
        (feat_row->>'feat_id')::INT,
        COALESCE(feat_row->>'source_type', 'player'),
        NULLIF(feat_row->>'source_id', '')::INT,
        feat_row->>'selection_key',
        feat_row->>'notes'
    FROM jsonb_array_elements(COALESCE(p_payload->'feats', '[]'::JSONB)) AS feat_row
    WHERE feat_row->>'feat_id' IS NOT NULL;

    INSERT INTO character_trait_options (
        character_id, trait_id, option_group, selection_key,
        trait_option_id, source_type, source_id, notes
    )
    SELECT
        new_id,
        (opt_row->>'trait_id')::INT,
        COALESCE(opt_row->>'option_group', 'default'),
        COALESCE(opt_row->>'selection_key', 'default'),
        (opt_row->>'trait_option_id')::INT,
        COALESCE(opt_row->>'source_type', 'player'),
        NULLIF(opt_row->>'source_id', '')::INT,
        opt_row->>'notes'
    FROM jsonb_array_elements(COALESCE(p_payload->'trait_options', '[]'::JSONB)) AS opt_row
    WHERE opt_row->>'trait_id' IS NOT NULL
      AND opt_row->>'trait_option_id' IS NOT NULL;

    INSERT INTO character_trait_spell_choices (
        character_id, trait_id, choice_group, selection_key, spell_level,
        spell_id, trait_option_id, spell_list_id, source_type, source_id, notes
    )
    SELECT
        new_id,
        (spell_row->>'trait_id')::INT,
        spell_row->>'choice_group',
        COALESCE(spell_row->>'selection_key', 'default'),
        (spell_row->>'spell_level')::INT,
        (spell_row->>'spell_id')::INT,
        NULLIF(spell_row->>'trait_option_id', '')::INT,
        NULLIF(spell_row->>'spell_list_id', '')::INT,
        COALESCE(spell_row->>'source_type', 'player'),
        NULLIF(spell_row->>'source_id', '')::INT,
        spell_row->>'notes'
    FROM jsonb_array_elements(COALESCE(p_payload->'trait_spell_choices', '[]'::JSONB)) AS spell_row
    WHERE spell_row->>'trait_id' IS NOT NULL
      AND spell_row->>'spell_id' IS NOT NULL
      AND spell_row->>'choice_group' IS NOT NULL
      AND spell_row->>'spell_level' IS NOT NULL;

    INSERT INTO inventory (character_id, item_id, quantity, is_equipped, is_attuned)
    SELECT
        new_id,
        (inv_row->>'item_id')::INT,
        COALESCE((inv_row->>'quantity')::INT, 1),
        COALESCE((inv_row->>'is_equipped')::BOOLEAN, FALSE),
        COALESCE((inv_row->>'is_attuned')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(COALESCE(p_payload->'inventory', '[]'::JSONB)) AS inv_row
    WHERE inv_row->>'item_id' IS NOT NULL
    ON CONFLICT (character_id, item_id) DO UPDATE
        SET quantity = EXCLUDED.quantity,
            is_equipped = EXCLUDED.is_equipped,
            is_attuned = EXCLUDED.is_attuned;

    INSERT INTO character_spells (character_id, spell_id, source_type, is_prepared, always_prepared)
    SELECT
        new_id,
        (spell_row->>'spell_id')::INT,
        COALESCE(spell_row->>'source_type', 'player'),
        COALESCE((spell_row->>'is_prepared')::BOOLEAN, FALSE),
        COALESCE((spell_row->>'always_prepared')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(COALESCE(p_payload->'spells', '[]'::JSONB)) AS spell_row
    WHERE spell_row->>'spell_id' IS NOT NULL
    ON CONFLICT (character_id, spell_id) DO UPDATE
        SET is_prepared = EXCLUDED.is_prepared,
            always_prepared = EXCLUDED.always_prepared;

    PERFORM public.sync_character_spell_slots(new_id);
    PERFORM public.sync_character_resources(new_id);

    RETURN jsonb_build_object(
        'character_id', new_id,
        'level', total_level,
        'sheet', public.get_character_sheet(new_id)
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- level_up_character
-- ---------------------------------------------------------------------------

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
    total_level INT;
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

    IF NOT EXISTS (
        SELECT 1
        FROM character_classes cc
        WHERE cc.character_id = p_character_id
          AND cc.class_id = p_class_id
    ) THEN
        IF p_new_class_level <> 1 THEN
            RAISE EXCEPTION 'Multiclass entry must start at class_level 1';
        END IF;

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

    total_level := private.character_total_level(p_character_id);

    UPDATE characters
    SET level = total_level,
        proficiency_bonus = private.proficiency_bonus_for_level(total_level)
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
        'total_level', total_level,
        'sheet', public.get_character_sheet(p_character_id)
    );
END;
$$;

COMMENT ON FUNCTION public.create_character IS
    'Cria personagem: classes, proficiências de classe/background, escolhas, inventário; sync slots/cargas.';

COMMENT ON FUNCTION public.level_up_character IS
    'Sobe nível de classe (ou multiclasse); atualiza proficiency_bonus, slots e recursos.';

GRANT EXECUTE ON FUNCTION public.set_inventory_equipped(INT, INT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_inventory_attuned(INT, INT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(INT, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_character_sheet(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.adjust_character_hp(INT, INT, VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_character_spell_slots(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.spend_spell_slot(INT, INT, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_spell_slots(INT, VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_character_resources(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.spend_character_resource(INT, INT, VARCHAR, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.spend_trait_spell_charge(INT, INT, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_character_resources(INT, VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_short_rest(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_long_rest(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_character_condition(INT, VARCHAR, BOOLEAN, VARCHAR, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_character_roll_context(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_character(JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.level_up_character(INT, INT, INT, INT, JSONB) TO authenticated, service_role;
