-- Migration: 000021 — seed 006_dnd_2024_languages_roles_dice
BEGIN;

-- D&D 2024 / SRD 5.2.1 language catalog plus app campaign roles and dice.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
-- The SRD language tables do not expose scripts, so script is intentionally NULL.
INSERT INTO roles (name) VALUES
    ('Owner'),
    ('Dungeon Master'),
    ('Player'),
    ('Spectator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO dice (name, sides) VALUES
    ('d2', 2),
    ('d3', 3),
    ('d4', 4),
    ('d6', 6),
    ('d8', 8),
    ('d10', 10),
    ('d12', 12),
    ('d20', 20),
    ('d100', 100)
ON CONFLICT (name) DO UPDATE SET
    sides = EXCLUDED.sides;

INSERT INTO languages (
    name,
    category,
    script,
    description
) VALUES
    ('Common', 'Standard', NULL, 'A widespread language known by every player character by default.'),
    ('Common Sign Language', 'Standard', NULL, 'A widespread signed language available from the Standard Languages table.'),
    ('Draconic', 'Standard', NULL, 'A standard language associated with dragons and dragonborn.'),
    ('Dwarvish', 'Standard', NULL, 'A standard language associated with dwarves.'),
    ('Elvish', 'Standard', NULL, 'A standard language associated with elves.'),
    ('Giant', 'Standard', NULL, 'A standard language associated with giants.'),
    ('Gnomish', 'Standard', NULL, 'A standard language associated with gnomes.'),
    ('Goblin', 'Standard', NULL, 'A standard language associated with goblinoids.'),
    ('Halfling', 'Standard', NULL, 'A standard language associated with halflings.'),
    ('Orc', 'Standard', NULL, 'A standard language associated with orcs.'),
    ('Abyssal', 'Rare', NULL, 'A rare language derived from or associated with planar powers.'),
    ('Celestial', 'Rare', NULL, 'A rare language derived from or associated with planar powers.'),
    ('Deep Speech', 'Rare', NULL, 'A rare language used by strange or alien creatures.'),
    ('Druidic', 'Rare', NULL, 'A rare secret language associated with druids.'),
    ('Infernal', 'Rare', NULL, 'A rare language derived from or associated with planar powers.'),
    ('Primordial', 'Rare', NULL, 'A rare language whose dialects include Aquan, Auran, Ignan, and Terran.'),
    ('Sylvan', 'Rare', NULL, 'A rare language associated with fey and the wild.'),
    ('Thieves'' Cant', 'Rare', NULL, 'A rare secret language associated with thieves and rogues.'),
    ('Undercommon', 'Rare', NULL, 'A rare language associated with underground cultures.')
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    script = EXCLUDED.script,
    description = EXCLUDED.description;

COMMIT;
