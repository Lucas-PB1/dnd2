-- Ouro inicial PHB no personagem + payload create_character.starting_gold_gp

BEGIN;

ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS starting_gold_gp INT NOT NULL DEFAULT 0
    CHECK (starting_gold_gp >= 0);

COMMENT ON COLUMN characters.starting_gold_gp IS
    'Ouro inicial em PO (PHB 2024) quando o builder escolhe ouro em vez do pacote de equipamento.';

DROP VIEW IF EXISTS v_character_summary;

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
    ) AS conditions
FROM characters c
LEFT JOIN species s ON s.id = c.species_id
LEFT JOIN backgrounds b ON b.id = c.background_id;

CREATE OR REPLACE FUNCTION public.create_character(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id INT;
    owner_id UUID;
    species_id INT;
    payload_background_id INT;
    total_level INT := 0;
    class_row JSONB;
    loop_class_id INT;
    loop_class_level INT;
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
    payload_background_id := (p_payload->>'background_id')::INT;

    IF species_id IS NULL OR payload_background_id IS NULL THEN
        RAISE EXCEPTION 'species_id and background_id are required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM species WHERE id = species_id) THEN
        RAISE EXCEPTION 'Unknown species_id %', species_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM backgrounds WHERE id = payload_background_id) THEN
        RAISE EXCEPTION 'Unknown background_id %', payload_background_id;
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
        armor_class,
        starting_gold_gp
    )
    SELECT
        owner_id,
        species_id,
        payload_background_id,
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
        COALESCE((p_payload->>'armor_class')::INT, 10),
        GREATEST(COALESCE((p_payload->>'starting_gold_gp')::INT, 0), 0)
    FROM species s
    WHERE s.id = species_id
    RETURNING id INTO new_id;

    FOR class_row IN SELECT value FROM jsonb_array_elements(p_payload->'classes')
    LOOP
        loop_class_id := (class_row->>'class_id')::INT;
        loop_class_level := COALESCE((class_row->>'class_level')::INT, 1);

        IF NOT EXISTS (SELECT 1 FROM classes WHERE id = loop_class_id) THEN
            RAISE EXCEPTION 'Unknown class_id %', loop_class_id;
        END IF;

        INSERT INTO character_classes (character_id, class_id, subclass_id, class_level)
        VALUES (
            new_id,
            loop_class_id,
            NULLIF(class_row->>'subclass_id', '')::INT,
            loop_class_level
        );

        INSERT INTO character_proficiencies (
            character_id, proficiency_type, name, source_type, source_id
        )
        SELECT
            new_id,
            v.proficiency_type,
            v.name,
            'class',
            loop_class_id
        FROM v_class_proficiency_details v
        WHERE v.class_id = loop_class_id
          AND v.requires_choice = FALSE
        ON CONFLICT (character_id, proficiency_type, name) DO NOTHING;
    END LOOP;

    INSERT INTO character_skills (character_id, skill_id, is_proficient, has_expertise)
    SELECT new_id, bsp.skill_id, TRUE, FALSE
    FROM background_skill_proficiencies bsp
    WHERE bsp.background_id = payload_background_id
    ON CONFLICT (character_id, skill_id) DO UPDATE
        SET is_proficient = TRUE;

    INSERT INTO character_feats (character_id, feat_id, source_type, source_id, selection_key)
    SELECT
        new_id,
        b.origin_feat_id,
        'background',
        payload_background_id,
        b.origin_feat_selection_key
    FROM backgrounds b
    WHERE b.id = payload_background_id
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

COMMENT ON FUNCTION public.create_character IS
    'Cria personagem: classes, proficiências, escolhas, inventário, starting_gold_gp; sync slots/cargas.';

COMMIT;
