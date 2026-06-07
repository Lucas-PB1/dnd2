-- Migration: 000020 — seed 005_dnd_2024_backgrounds
BEGIN;

-- D&D 2024 background catalog generated from backup/backgrounds.json.
-- Ability, skill, tool and equipment data live in normalized child tables.

CREATE TEMP TABLE _import_background_origin_feat_data (
    name TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    prerequisite_text TEXT,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
) ON COMMIT DROP;

INSERT INTO _import_background_origin_feat_data (
    name,
    category,
    prerequisite_text,
    is_repeatable,
    description
) VALUES
    ('Alert', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Crafter', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Healer', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Lucky', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Magic Initiate', 'Origin', NULL, TRUE, 'D&D 2024 Origin feat imported for background support.'),
    ('Musician', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Savage Attacker', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Skilled', 'Origin', NULL, TRUE, 'D&D 2024 Origin feat imported for background support.'),
    ('Tavern Brawler', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.'),
    ('Tough', 'Origin', NULL, FALSE, 'D&D 2024 Origin feat imported for background support.');

CREATE TEMP TABLE _import_background_data (
    name TEXT PRIMARY KEY,
    origin_feat_name TEXT NOT NULL,
    origin_feat_selection_key TEXT,
    description TEXT
) ON COMMIT DROP;

INSERT INTO _import_background_data (
    name,
    origin_feat_name,
    origin_feat_selection_key,
    description
) VALUES
    ('Acolyte', 'Magic Initiate', 'Cleric', 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Artisan', 'Crafter', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Charlatan', 'Skilled', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Criminal', 'Alert', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Entertainer', 'Musician', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Farmer', 'Tough', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Guard', 'Alert', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Guide', 'Magic Initiate', 'Druid', 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Hermit', 'Healer', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Merchant', 'Lucky', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Noble', 'Skilled', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Sage', 'Magic Initiate', 'Wizard', 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Sailor', 'Tavern Brawler', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Scribe', 'Skilled', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Soldier', 'Savage Attacker', NULL, 'D&D 2024 background imported from backup/backgrounds.json.'),
    ('Wayfarer', 'Lucky', NULL, 'D&D 2024 background imported from backup/backgrounds.json.');

CREATE TEMP TABLE _import_background_ability_data (
    background_name TEXT NOT NULL,
    ability TEXT NOT NULL,
    PRIMARY KEY (background_name, ability)
) ON COMMIT DROP;

INSERT INTO _import_background_ability_data (
    background_name,
    ability
) VALUES
    ('Acolyte', 'CHA'),
    ('Acolyte', 'INT'),
    ('Acolyte', 'WIS'),
    ('Artisan', 'DEX'),
    ('Artisan', 'INT'),
    ('Artisan', 'STR'),
    ('Charlatan', 'CHA'),
    ('Charlatan', 'CON'),
    ('Charlatan', 'DEX'),
    ('Criminal', 'CON'),
    ('Criminal', 'DEX'),
    ('Criminal', 'INT'),
    ('Entertainer', 'CHA'),
    ('Entertainer', 'DEX'),
    ('Entertainer', 'STR'),
    ('Farmer', 'CON'),
    ('Farmer', 'STR'),
    ('Farmer', 'WIS'),
    ('Guard', 'INT'),
    ('Guard', 'STR'),
    ('Guard', 'WIS'),
    ('Guide', 'CON'),
    ('Guide', 'DEX'),
    ('Guide', 'WIS'),
    ('Hermit', 'CHA'),
    ('Hermit', 'CON'),
    ('Hermit', 'WIS'),
    ('Merchant', 'CHA'),
    ('Merchant', 'CON'),
    ('Merchant', 'INT'),
    ('Noble', 'CHA'),
    ('Noble', 'INT'),
    ('Noble', 'STR'),
    ('Sage', 'CON'),
    ('Sage', 'INT'),
    ('Sage', 'WIS'),
    ('Sailor', 'DEX'),
    ('Sailor', 'STR'),
    ('Sailor', 'WIS'),
    ('Scribe', 'DEX'),
    ('Scribe', 'INT'),
    ('Scribe', 'WIS'),
    ('Soldier', 'CON'),
    ('Soldier', 'DEX'),
    ('Soldier', 'STR'),
    ('Wayfarer', 'CHA'),
    ('Wayfarer', 'DEX'),
    ('Wayfarer', 'WIS');

CREATE TEMP TABLE _import_background_skill_data (
    background_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    PRIMARY KEY (background_name, skill_name)
) ON COMMIT DROP;

INSERT INTO _import_background_skill_data (
    background_name,
    skill_name
) VALUES
    ('Acolyte', 'Insight'),
    ('Acolyte', 'Religion'),
    ('Artisan', 'Investigation'),
    ('Artisan', 'Persuasion'),
    ('Charlatan', 'Deception'),
    ('Charlatan', 'Sleight of Hand'),
    ('Criminal', 'Sleight of Hand'),
    ('Criminal', 'Stealth'),
    ('Entertainer', 'Acrobatics'),
    ('Entertainer', 'Performance'),
    ('Farmer', 'Animal Handling'),
    ('Farmer', 'Nature'),
    ('Guard', 'Athletics'),
    ('Guard', 'Perception'),
    ('Guide', 'Stealth'),
    ('Guide', 'Survival'),
    ('Hermit', 'Medicine'),
    ('Hermit', 'Religion'),
    ('Merchant', 'Animal Handling'),
    ('Merchant', 'Persuasion'),
    ('Noble', 'History'),
    ('Noble', 'Persuasion'),
    ('Sage', 'Arcana'),
    ('Sage', 'History'),
    ('Sailor', 'Acrobatics'),
    ('Sailor', 'Perception'),
    ('Scribe', 'Investigation'),
    ('Scribe', 'Perception'),
    ('Soldier', 'Athletics'),
    ('Soldier', 'Intimidation'),
    ('Wayfarer', 'Insight'),
    ('Wayfarer', 'Stealth');

CREATE TEMP TABLE _import_background_tool_data (
    background_name TEXT NOT NULL,
    option_group TEXT NOT NULL DEFAULT 'Tool Proficiency',
    choice_count INT NOT NULL DEFAULT 1,
    tool_name TEXT,
    tool_category TEXT,
    option_name TEXT NOT NULL,
    notes TEXT,
    PRIMARY KEY (background_name, option_group, option_name)
) ON COMMIT DROP;

INSERT INTO _import_background_tool_data (
    background_name,
    tool_name,
    tool_category,
    option_name,
    notes
) VALUES
    ('Acolyte', 'Calligrapher''s Supplies', NULL, 'Calligrapher''s Supplies', 'Calligrapher''s Supplies'),
    ('Artisan', NULL, 'Artisan', 'Choose one kind of Artisan''s Tools', 'Choose one kind of Artisan''s Tools'),
    ('Charlatan', 'Forgery Kit', NULL, 'Forgery Kit', 'Forgery Kit'),
    ('Criminal', 'Thieves'' Tools', NULL, 'Thieves'' Tools', 'Thieves'' Tools'),
    ('Entertainer', NULL, 'Musical Instrument', 'Choose one kind of Musical Instrument', 'Choose one kind of Musical Instrument'),
    ('Farmer', 'Carpenter''s Tools', NULL, 'Carpenter''s Tools', 'Carpenter''s Tools'),
    ('Guard', NULL, 'Gaming Set', 'Choose one kind of Gaming Set', 'Choose one kind of Gaming Set'),
    ('Guide', 'Cartographer''s Tools', NULL, 'Cartographer''s Tools', 'Cartographer''s Tools'),
    ('Hermit', 'Herbalism Kit', NULL, 'Herbalism Kit', 'Herbalism Kit'),
    ('Merchant', 'Navigator''s Tools', NULL, 'Navigator''s Tools', 'Navigator''s Tools'),
    ('Noble', NULL, 'Gaming Set', 'Choose one kind of Gaming Set', 'Choose one kind of Gaming Set'),
    ('Sage', 'Calligrapher''s Supplies', NULL, 'Calligrapher''s Supplies', 'Calligrapher''s Supplies'),
    ('Sailor', 'Navigator''s Tools', NULL, 'Navigator''s Tools', 'Navigator''s Tools'),
    ('Scribe', 'Calligrapher''s Supplies', NULL, 'Calligrapher''s Supplies', 'Calligrapher''s Supplies'),
    ('Soldier', NULL, 'Gaming Set', 'Choose one kind of Gaming Set', 'Choose one kind of Gaming Set'),
    ('Wayfarer', 'Thieves'' Tools', NULL, 'Thieves'' Tools', 'Thieves'' Tools');

INSERT INTO feats (
    name,
    category,
    prerequisite_text,
    is_repeatable,
    description
)
SELECT
    name,
    category,
    prerequisite_text,
    is_repeatable,
    description
FROM _import_background_origin_feat_data
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    prerequisite_text = COALESCE(feats.prerequisite_text, EXCLUDED.prerequisite_text),
    is_repeatable = feats.is_repeatable OR EXCLUDED.is_repeatable,
    description = COALESCE(feats.description, EXCLUDED.description);

INSERT INTO backgrounds (
    origin_feat_id,
    origin_feat_selection_key,
    name,
    description
)
SELECT
    f.id,
    bd.origin_feat_selection_key,
    bd.name,
    bd.description
FROM _import_background_data bd
JOIN feats f ON f.name = bd.origin_feat_name
ON CONFLICT (name) DO UPDATE SET
    origin_feat_id = EXCLUDED.origin_feat_id,
    origin_feat_selection_key = EXCLUDED.origin_feat_selection_key,
    description = EXCLUDED.description;

DELETE FROM background_ability_options bao
USING backgrounds b, _import_background_data bd
WHERE bao.background_id = b.id
  AND b.name = bd.name;

INSERT INTO background_ability_options (
    background_id,
    ability
)
SELECT
    b.id,
    bad.ability
FROM _import_background_ability_data bad
JOIN backgrounds b ON b.name = bad.background_name
ON CONFLICT (background_id, ability) DO NOTHING;

DELETE FROM background_skill_proficiencies bsp
USING backgrounds b, _import_background_data bd
WHERE bsp.background_id = b.id
  AND b.name = bd.name;

INSERT INTO background_skill_proficiencies (
    background_id,
    skill_id
)
SELECT
    b.id,
    sk.id
FROM _import_background_skill_data bsd
JOIN backgrounds b ON b.name = bsd.background_name
JOIN skills sk ON sk.name = bsd.skill_name
ON CONFLICT (background_id, skill_id) DO NOTHING;

DELETE FROM background_tool_proficiency_options btpo
USING backgrounds b, _import_background_data bd
WHERE btpo.background_id = b.id
  AND b.name = bd.name;

INSERT INTO background_tool_proficiency_options (
    background_id,
    option_group,
    choice_count,
    tool_id,
    tool_category,
    name,
    notes
)
SELECT
    b.id,
    btd.option_group,
    btd.choice_count,
    tl.id,
    btd.tool_category,
    btd.option_name,
    btd.notes
FROM _import_background_tool_data btd
JOIN backgrounds b ON b.name = btd.background_name
LEFT JOIN tools tl ON tl.name = btd.tool_name
ON CONFLICT (background_id, option_group, name) DO UPDATE SET
    choice_count = EXCLUDED.choice_count,
    tool_id = EXCLUDED.tool_id,
    tool_category = EXCLUDED.tool_category,
    notes = EXCLUDED.notes;

COMMIT;
