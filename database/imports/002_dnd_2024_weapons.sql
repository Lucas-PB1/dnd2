BEGIN;

-- D&D 2024 / SRD 5.2.1 weapon catalog.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
-- Fixed weapon damage, such as the Blowgun's 1 Piercing, uses a NULL die_id
-- with flat_bonus set to the fixed damage value.
CREATE TEMP TABLE _import_weapon_data (
    name TEXT PRIMARY KEY,
    cost_gp NUMERIC(10,2),
    weight_lb NUMERIC(8,2),
    weapon_category TEXT,
    damage_die TEXT,
    die_count INT NOT NULL,
    flat_bonus INT NOT NULL,
    damage_type TEXT NOT NULL,
    mastery_name TEXT NOT NULL,
    range_normal INT,
    range_long INT,
    is_two_handed BOOLEAN NOT NULL
) ON COMMIT DROP;

INSERT INTO _import_weapon_data (
    name,
    cost_gp,
    weight_lb,
    weapon_category,
    damage_die,
    die_count,
    flat_bonus,
    damage_type,
    mastery_name,
    range_normal,
    range_long,
    is_two_handed
) VALUES
    ('Club', 0.10, 2.00, 'Simple Melee', 'd4', 1, 0, 'Bludgeoning', 'Slow', NULL, NULL, FALSE),
    ('Dagger', 2.00, 1.00, 'Simple Melee', 'd4', 1, 0, 'Piercing', 'Nick', 20, 60, FALSE),
    ('Greatclub', 0.20, 10.00, 'Simple Melee', 'd8', 1, 0, 'Bludgeoning', 'Push', NULL, NULL, TRUE),
    ('Handaxe', 5.00, 2.00, 'Simple Melee', 'd6', 1, 0, 'Slashing', 'Vex', 20, 60, FALSE),
    ('Javelin', 0.50, 2.00, 'Simple Melee', 'd6', 1, 0, 'Piercing', 'Slow', 30, 120, FALSE),
    ('Light Hammer', 2.00, 2.00, 'Simple Melee', 'd4', 1, 0, 'Bludgeoning', 'Nick', 20, 60, FALSE),
    ('Mace', 5.00, 4.00, 'Simple Melee', 'd6', 1, 0, 'Bludgeoning', 'Sap', NULL, NULL, FALSE),
    ('Quarterstaff', 0.20, 4.00, 'Simple Melee', 'd6', 1, 0, 'Bludgeoning', 'Topple', NULL, NULL, FALSE),
    ('Sickle', 1.00, 2.00, 'Simple Melee', 'd4', 1, 0, 'Slashing', 'Nick', NULL, NULL, FALSE),
    ('Spear', 1.00, 3.00, 'Simple Melee', 'd6', 1, 0, 'Piercing', 'Sap', 20, 60, FALSE),
    ('Dart', 0.05, 0.25, 'Simple Ranged', 'd4', 1, 0, 'Piercing', 'Vex', 20, 60, FALSE),
    ('Light Crossbow', 25.00, 5.00, 'Simple Ranged', 'd8', 1, 0, 'Piercing', 'Slow', 80, 320, TRUE),
    ('Shortbow', 25.00, 2.00, 'Simple Ranged', 'd6', 1, 0, 'Piercing', 'Vex', 80, 320, TRUE),
    ('Sling', 0.10, NULL, 'Simple Ranged', 'd4', 1, 0, 'Bludgeoning', 'Slow', 30, 120, FALSE),
    ('Battleaxe', 10.00, 4.00, 'Martial Melee', 'd8', 1, 0, 'Slashing', 'Topple', NULL, NULL, FALSE),
    ('Flail', 10.00, 2.00, 'Martial Melee', 'd8', 1, 0, 'Bludgeoning', 'Sap', NULL, NULL, FALSE),
    ('Glaive', 20.00, 6.00, 'Martial Melee', 'd10', 1, 0, 'Slashing', 'Graze', NULL, NULL, TRUE),
    ('Greataxe', 30.00, 7.00, 'Martial Melee', 'd12', 1, 0, 'Slashing', 'Cleave', NULL, NULL, TRUE),
    ('Greatsword', 50.00, 6.00, 'Martial Melee', 'd6', 2, 0, 'Slashing', 'Graze', NULL, NULL, TRUE),
    ('Halberd', 20.00, 6.00, 'Martial Melee', 'd10', 1, 0, 'Slashing', 'Cleave', NULL, NULL, TRUE),
    ('Lance', 10.00, 6.00, 'Martial Melee', 'd10', 1, 0, 'Piercing', 'Topple', NULL, NULL, TRUE),
    ('Longsword', 15.00, 3.00, 'Martial Melee', 'd8', 1, 0, 'Slashing', 'Sap', NULL, NULL, FALSE),
    ('Maul', 10.00, 10.00, 'Martial Melee', 'd6', 2, 0, 'Bludgeoning', 'Topple', NULL, NULL, TRUE),
    ('Morningstar', 15.00, 4.00, 'Martial Melee', 'd8', 1, 0, 'Piercing', 'Sap', NULL, NULL, FALSE),
    ('Pike', 5.00, 18.00, 'Martial Melee', 'd10', 1, 0, 'Piercing', 'Push', NULL, NULL, TRUE),
    ('Rapier', 25.00, 2.00, 'Martial Melee', 'd8', 1, 0, 'Piercing', 'Vex', NULL, NULL, FALSE),
    ('Scimitar', 25.00, 3.00, 'Martial Melee', 'd6', 1, 0, 'Slashing', 'Nick', NULL, NULL, FALSE),
    ('Shortsword', 10.00, 2.00, 'Martial Melee', 'd6', 1, 0, 'Piercing', 'Vex', NULL, NULL, FALSE),
    ('Trident', 5.00, 4.00, 'Martial Melee', 'd8', 1, 0, 'Piercing', 'Topple', 20, 60, FALSE),
    ('Warhammer', 15.00, 5.00, 'Martial Melee', 'd8', 1, 0, 'Bludgeoning', 'Push', NULL, NULL, FALSE),
    ('War Pick', 5.00, 2.00, 'Martial Melee', 'd8', 1, 0, 'Piercing', 'Sap', NULL, NULL, FALSE),
    ('Whip', 2.00, 3.00, 'Martial Melee', 'd4', 1, 0, 'Slashing', 'Slow', NULL, NULL, FALSE),
    ('Blowgun', 10.00, 1.00, 'Martial Ranged', NULL, 1, 1, 'Piercing', 'Vex', 25, 100, FALSE),
    ('Hand Crossbow', 75.00, 3.00, 'Martial Ranged', 'd6', 1, 0, 'Piercing', 'Vex', 30, 120, FALSE),
    ('Heavy Crossbow', 50.00, 18.00, 'Martial Ranged', 'd10', 1, 0, 'Piercing', 'Push', 100, 400, TRUE),
    ('Longbow', 50.00, 2.00, 'Martial Ranged', 'd8', 1, 0, 'Piercing', 'Slow', 150, 600, TRUE),
    ('Musket', 500.00, 10.00, 'Martial Ranged', 'd12', 1, 0, 'Piercing', 'Slow', 40, 120, TRUE),
    ('Pistol', 250.00, 3.00, 'Martial Ranged', 'd10', 1, 0, 'Piercing', 'Vex', 30, 90, FALSE);

CREATE TEMP TABLE _import_weapon_property_data (
    weapon_name TEXT NOT NULL,
    property_name TEXT NOT NULL,
    details TEXT,
    PRIMARY KEY (weapon_name, property_name)
) ON COMMIT DROP;

INSERT INTO _import_weapon_property_data (
    weapon_name,
    property_name,
    details
) VALUES
    ('Club', 'Light', NULL),
    ('Dagger', 'Finesse', NULL),
    ('Dagger', 'Light', NULL),
    ('Dagger', 'Thrown', 'Range 20/60'),
    ('Greatclub', 'Two-Handed', NULL),
    ('Handaxe', 'Light', NULL),
    ('Handaxe', 'Thrown', 'Range 20/60'),
    ('Javelin', 'Thrown', 'Range 30/120'),
    ('Light Hammer', 'Light', NULL),
    ('Light Hammer', 'Thrown', 'Range 20/60'),
    ('Quarterstaff', 'Versatile', '1d8'),
    ('Sickle', 'Light', NULL),
    ('Spear', 'Thrown', 'Range 20/60'),
    ('Spear', 'Versatile', '1d8'),
    ('Dart', 'Finesse', NULL),
    ('Dart', 'Thrown', 'Range 20/60'),
    ('Light Crossbow', 'Ammunition', 'Range 80/320; Bolt'),
    ('Light Crossbow', 'Loading', NULL),
    ('Light Crossbow', 'Two-Handed', NULL),
    ('Shortbow', 'Ammunition', 'Range 80/320; Arrow'),
    ('Shortbow', 'Two-Handed', NULL),
    ('Sling', 'Ammunition', 'Range 30/120; Bullet'),
    ('Battleaxe', 'Versatile', '1d10'),
    ('Glaive', 'Heavy', NULL),
    ('Glaive', 'Reach', NULL),
    ('Glaive', 'Two-Handed', NULL),
    ('Greataxe', 'Heavy', NULL),
    ('Greataxe', 'Two-Handed', NULL),
    ('Greatsword', 'Heavy', NULL),
    ('Greatsword', 'Two-Handed', NULL),
    ('Halberd', 'Heavy', NULL),
    ('Halberd', 'Reach', NULL),
    ('Halberd', 'Two-Handed', NULL),
    ('Lance', 'Heavy', NULL),
    ('Lance', 'Reach', NULL),
    ('Lance', 'Two-Handed', 'unless mounted'),
    ('Longsword', 'Versatile', '1d10'),
    ('Maul', 'Heavy', NULL),
    ('Maul', 'Two-Handed', NULL),
    ('Pike', 'Heavy', NULL),
    ('Pike', 'Reach', NULL),
    ('Pike', 'Two-Handed', NULL),
    ('Rapier', 'Finesse', NULL),
    ('Scimitar', 'Finesse', NULL),
    ('Scimitar', 'Light', NULL),
    ('Shortsword', 'Finesse', NULL),
    ('Shortsword', 'Light', NULL),
    ('Trident', 'Thrown', 'Range 20/60'),
    ('Trident', 'Versatile', '1d10'),
    ('Warhammer', 'Versatile', '1d10'),
    ('War Pick', 'Versatile', '1d10'),
    ('Whip', 'Finesse', NULL),
    ('Whip', 'Reach', NULL),
    ('Blowgun', 'Ammunition', 'Range 25/100; Needle'),
    ('Blowgun', 'Loading', NULL),
    ('Hand Crossbow', 'Ammunition', 'Range 30/120; Bolt'),
    ('Hand Crossbow', 'Light', NULL),
    ('Hand Crossbow', 'Loading', NULL),
    ('Heavy Crossbow', 'Ammunition', 'Range 100/400; Bolt'),
    ('Heavy Crossbow', 'Heavy', NULL),
    ('Heavy Crossbow', 'Loading', NULL),
    ('Heavy Crossbow', 'Two-Handed', NULL),
    ('Longbow', 'Ammunition', 'Range 150/600; Arrow'),
    ('Longbow', 'Heavy', NULL),
    ('Longbow', 'Two-Handed', NULL),
    ('Musket', 'Ammunition', 'Range 40/120; Bullet'),
    ('Musket', 'Loading', NULL),
    ('Musket', 'Two-Handed', NULL),
    ('Pistol', 'Ammunition', 'Range 30/90; Bullet'),
    ('Pistol', 'Loading', NULL);

INSERT INTO dice (name, sides) VALUES
    ('d4', 4),
    ('d6', 6),
    ('d8', 8),
    ('d10', 10),
    ('d12', 12)
ON CONFLICT (name) DO UPDATE SET
    sides = EXCLUDED.sides;

INSERT INTO damage_types (name) VALUES
    ('Bludgeoning'),
    ('Piercing'),
    ('Slashing')
ON CONFLICT (name) DO NOTHING;

INSERT INTO weapon_properties (name, description) VALUES
    ('Ammunition', 'Requires ammunition to make ranged attacks; details record range and ammunition type.'),
    ('Finesse', 'Use Strength or Dexterity for attack and damage rolls.'),
    ('Heavy', 'Melee Heavy weapons need Strength 13, and ranged Heavy weapons need Dexterity 13, to avoid Disadvantage.'),
    ('Light', 'Enables one extra attack as a Bonus Action with a different Light weapon.'),
    ('Loading', 'Only one piece of ammunition can be fired with an action, Bonus Action, or Reaction.'),
    ('Reach', 'Adds 5 feet to reach for attacks and Opportunity Attacks.'),
    ('Thrown', 'Can be thrown to make a ranged attack; details record range.'),
    ('Two-Handed', 'Requires two hands when attacking with it.'),
    ('Versatile', 'Can be used with one or two hands; details record two-handed damage.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

INSERT INTO weapon_masteries (name, description) VALUES
    ('Cleave', 'After hitting with a melee attack, make one extra attack against a second nearby creature once per turn.'),
    ('Graze', 'On a miss, deal damage equal to the attack ability modifier.'),
    ('Nick', 'The Light property extra attack can be made as part of the Attack action once per turn.'),
    ('Push', 'On a hit, push a Large or smaller creature up to 10 feet straight away.'),
    ('Sap', 'On a hit, the target has Disadvantage on its next attack roll before your next turn.'),
    ('Slow', 'On a hit that deals damage, reduce target Speed by 10 feet until your next turn.'),
    ('Topple', 'On a hit, force a Constitution save or the target gains the Prone condition.'),
    ('Vex', 'On a hit that deals damage, gain Advantage on your next attack roll against that target before your next turn.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

INSERT INTO items (
    name,
    description,
    cost_gp,
    weight_lb,
    is_magical
)
SELECT
    wd.name,
    'D&D 2024 weapon. '
        || wd.weapon_category
        || '. Damage: '
        || CASE
            WHEN wd.damage_die IS NULL THEN wd.flat_bonus::TEXT
            ELSE wd.die_count::TEXT || wd.damage_die
        END
        || ' '
        || wd.damage_type
        || '. Mastery: '
        || wd.mastery_name
        || '.',
    wd.cost_gp,
    wd.weight_lb,
    FALSE
FROM _import_weapon_data wd
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    cost_gp = EXCLUDED.cost_gp,
    weight_lb = EXCLUDED.weight_lb,
    is_magical = EXCLUDED.is_magical;

INSERT INTO effects (
    name,
    description,
    effect_type
)
SELECT
    'Weapon Damage: ' || wd.name,
    'Base damage for ' || wd.name || '.',
    'damage'
FROM _import_weapon_data wd
WHERE NOT EXISTS (
    SELECT 1
    FROM effects e
    WHERE e.name = 'Weapon Damage: ' || wd.name
      AND e.effect_type = 'damage'
);

WITH selected_damage_effects AS (
    SELECT DISTINCT ON (wd.name)
        wd.name,
        e.id AS effect_id,
        d.id AS die_id,
        dt.id AS damage_type_id,
        wd.die_count,
        wd.flat_bonus
    FROM _import_weapon_data wd
    JOIN effects e ON e.name = 'Weapon Damage: ' || wd.name
        AND e.effect_type = 'damage'
    LEFT JOIN dice d ON d.name = wd.damage_die
    JOIN damage_types dt ON dt.name = wd.damage_type
    ORDER BY wd.name, e.id
)
INSERT INTO effect_damage (
    effect_id,
    die_id,
    damage_type_id,
    die_count,
    flat_bonus
)
SELECT
    effect_id,
    die_id,
    damage_type_id,
    die_count,
    flat_bonus
FROM selected_damage_effects
ON CONFLICT (effect_id) DO UPDATE SET
    die_id = EXCLUDED.die_id,
    damage_type_id = EXCLUDED.damage_type_id,
    die_count = EXCLUDED.die_count,
    flat_bonus = EXCLUDED.flat_bonus;

CREATE TEMP TABLE _import_weapon_items ON COMMIT DROP AS
SELECT
    i.id AS item_id,
    wd.name
FROM _import_weapon_data wd
JOIN items i ON i.name = wd.name;

WITH selected_damage_effects AS (
    SELECT DISTINCT ON (wd.name)
        wd.name,
        e.id AS effect_id
    FROM _import_weapon_data wd
    JOIN effects e ON e.name = 'Weapon Damage: ' || wd.name
        AND e.effect_type = 'damage'
    ORDER BY wd.name, e.id
)
INSERT INTO weapons (
    item_id,
    damage_effect_id,
    mastery_id,
    weapon_category,
    range_normal,
    range_long,
    is_two_handed
)
SELECT
    iwi.item_id,
    sde.effect_id,
    wm.id,
    wd.weapon_category,
    wd.range_normal,
    wd.range_long,
    wd.is_two_handed
FROM _import_weapon_data wd
JOIN _import_weapon_items iwi ON iwi.name = wd.name
JOIN selected_damage_effects sde ON sde.name = wd.name
JOIN weapon_masteries wm ON wm.name = wd.mastery_name
ON CONFLICT (item_id) DO UPDATE SET
    damage_effect_id = EXCLUDED.damage_effect_id,
    mastery_id = EXCLUDED.mastery_id,
    weapon_category = EXCLUDED.weapon_category,
    range_normal = EXCLUDED.range_normal,
    range_long = EXCLUDED.range_long,
    is_two_handed = EXCLUDED.is_two_handed;

DELETE FROM weapon_has_properties whp
USING _import_weapon_items iwi
WHERE whp.item_id = iwi.item_id;

INSERT INTO weapon_has_properties (
    item_id,
    property_id,
    details
)
SELECT
    iwi.item_id,
    wp.id,
    ipd.details
FROM _import_weapon_property_data ipd
JOIN _import_weapon_items iwi ON iwi.name = ipd.weapon_name
JOIN weapon_properties wp ON wp.name = ipd.property_name
ON CONFLICT (item_id, property_id) DO UPDATE SET
    details = EXCLUDED.details;

COMMIT;
