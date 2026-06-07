-- Migration: 000016 — seed 001_dnd_2024_armors
BEGIN;

-- D&D 2024 / SRD 5.2.1 armor catalog.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
-- ac_bonus is the armor's base AC for suits, and the AC bonus for shields.
WITH armor_data (
    name,
    description,
    cost_gp,
    weight_lb,
    category,
    ac_bonus,
    min_strength,
    stealth_disadvantage,
    plus_dex_modifier,
    max_dex_bonus
) AS (
    VALUES
        ('Padded Armor', 'Light armor. AC 11 + Dexterity modifier. Disadvantage on Dexterity (Stealth) checks.', 5.00, 8.00, 'Light', 11, 0, TRUE, TRUE, NULL),
        ('Leather Armor', 'Light armor. AC 11 + Dexterity modifier.', 10.00, 10.00, 'Light', 11, 0, FALSE, TRUE, NULL),
        ('Studded Leather Armor', 'Light armor. AC 12 + Dexterity modifier.', 45.00, 13.00, 'Light', 12, 0, FALSE, TRUE, NULL),
        ('Hide Armor', 'Medium armor. AC 12 + Dexterity modifier, maximum +2.', 10.00, 12.00, 'Medium', 12, 0, FALSE, TRUE, 2),
        ('Chain Shirt', 'Medium armor. AC 13 + Dexterity modifier, maximum +2.', 50.00, 20.00, 'Medium', 13, 0, FALSE, TRUE, 2),
        ('Scale Mail', 'Medium armor. AC 14 + Dexterity modifier, maximum +2. Disadvantage on Dexterity (Stealth) checks.', 50.00, 45.00, 'Medium', 14, 0, TRUE, TRUE, 2),
        ('Breastplate', 'Medium armor. AC 14 + Dexterity modifier, maximum +2.', 400.00, 20.00, 'Medium', 14, 0, FALSE, TRUE, 2),
        ('Half Plate Armor', 'Medium armor. AC 15 + Dexterity modifier, maximum +2. Disadvantage on Dexterity (Stealth) checks.', 750.00, 40.00, 'Medium', 15, 0, TRUE, TRUE, 2),
        ('Ring Mail', 'Heavy armor. AC 14. Disadvantage on Dexterity (Stealth) checks.', 30.00, 40.00, 'Heavy', 14, 0, TRUE, FALSE, NULL),
        ('Chain Mail', 'Heavy armor. AC 16. Requires Strength 13 to avoid speed reduction. Disadvantage on Dexterity (Stealth) checks.', 75.00, 55.00, 'Heavy', 16, 13, TRUE, FALSE, NULL),
        ('Splint Armor', 'Heavy armor. AC 17. Requires Strength 15 to avoid speed reduction. Disadvantage on Dexterity (Stealth) checks.', 200.00, 60.00, 'Heavy', 17, 15, TRUE, FALSE, NULL),
        ('Plate Armor', 'Heavy armor. AC 18. Requires Strength 15 to avoid speed reduction. Disadvantage on Dexterity (Stealth) checks.', 1500.00, 65.00, 'Heavy', 18, 15, TRUE, FALSE, NULL),
        ('Shield', 'Shield. +2 AC while wielded with shield training.', 10.00, 6.00, 'Shield', 2, 0, FALSE, FALSE, NULL)
),
upserted_items AS (
    INSERT INTO items (
        name,
        description,
        cost_gp,
        weight_lb,
        is_magical
    )
    SELECT
        name,
        description,
        cost_gp,
        weight_lb,
        FALSE
    FROM armor_data
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        cost_gp = EXCLUDED.cost_gp,
        weight_lb = EXCLUDED.weight_lb,
        is_magical = EXCLUDED.is_magical
    RETURNING id, name
)
INSERT INTO armors (
    item_id,
    ac_bonus,
    category,
    min_strength,
    stealth_disadvantage,
    plus_dex_modifier,
    max_dex_bonus
)
SELECT
    ui.id,
    ad.ac_bonus,
    ad.category,
    ad.min_strength,
    ad.stealth_disadvantage,
    ad.plus_dex_modifier,
    ad.max_dex_bonus
FROM armor_data ad
JOIN upserted_items ui ON ui.name = ad.name
ON CONFLICT (item_id) DO UPDATE SET
    ac_bonus = EXCLUDED.ac_bonus,
    category = EXCLUDED.category,
    min_strength = EXCLUDED.min_strength,
    stealth_disadvantage = EXCLUDED.stealth_disadvantage,
    plus_dex_modifier = EXCLUDED.plus_dex_modifier,
    max_dex_bonus = EXCLUDED.max_dex_bonus;

COMMIT;
