BEGIN;

-- D&D 2024 / SRD 5.2.1 feat catalog.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
CREATE TEMP TABLE _import_feat_data (
    name TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    prerequisite_text TEXT,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
) ON COMMIT DROP;

INSERT INTO _import_feat_data (
    name,
    category,
    prerequisite_text,
    is_repeatable,
    description
) VALUES
    ('Alert', 'Origin', NULL, FALSE, 'You react quickly to danger, improving Initiative and allowing an Initiative swap with a willing ally.'),
    ('Magic Initiate', 'Origin', NULL, TRUE, 'Choose the Cleric, Druid, or Wizard spell list. You learn two cantrips and one level 1 spell from that list, choose a spellcasting ability, and can replace one chosen spell whenever you gain a level.'),
    ('Savage Attacker', 'Origin', NULL, FALSE, 'Once per turn when you hit with a weapon, you can roll the weapon damage dice twice and use either roll.'),
    ('Skilled', 'Origin', NULL, TRUE, 'You gain proficiency in any combination of three skills or tools.'),
    ('Ability Score Improvement', 'General', 'Level 4+', TRUE, 'Increase one ability score by 2 and another by 1, or increase three ability scores by 1, without increasing a score above 20.'),
    ('Grappler', 'General', 'Level 4+, Strength or Dexterity 13+', FALSE, 'You improve grappling with an ability score increase, Punch and Grab, Advantage against creatures Grappled by you, and easier movement with creatures you grapple.'),
    ('Archery', 'Fighting Style', 'Fighting Style Feature', FALSE, 'You gain a +2 bonus to attack rolls you make with ranged weapons.'),
    ('Defense', 'Fighting Style', 'Fighting Style Feature', FALSE, 'While wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.'),
    ('Great Weapon Fighting', 'Fighting Style', 'Fighting Style Feature', FALSE, 'When rolling damage for a melee weapon held in two hands, treat any 1 or 2 on a damage die as a 3 if the weapon has the Two-Handed or Versatile property.'),
    ('Two-Weapon Fighting', 'Fighting Style', 'Fighting Style Feature', FALSE, 'When making the extra attack from the Light property, you can add your ability modifier to that attack damage if you are not already adding it.'),
    ('Boon of Combat Prowess', 'Epic Boon', 'Level 19+', FALSE, 'Increase one ability score by 1 to a maximum of 30, and once per turn you can turn a missed attack roll into a hit until the start of your next turn.'),
    ('Boon of Dimensional Travel', 'Epic Boon', 'Level 19+', FALSE, 'Increase one ability score by 1 to a maximum of 30, and teleport up to 30 feet after taking the Attack or Magic action.'),
    ('Boon of Fate', 'Epic Boon', 'Level 19+', FALSE, 'Increase one ability score by 1 to a maximum of 30, and influence a nearby D20 Test with 2d4 once before refreshing.'),
    ('Boon of Irresistible Offense', 'Epic Boon', 'Level 19+', FALSE, 'Increase Strength or Dexterity by 1 to a maximum of 30, ignore Resistance with weapon physical damage, and deal extra damage on a natural 20.'),
    ('Boon of Spell Recall', 'Epic Boon', 'Level 19+, Spellcasting Feature', FALSE, 'Increase Intelligence, Wisdom, or Charisma by 1 to a maximum of 30, and sometimes avoid expending level 1-4 spell slots.'),
    ('Boon of the Night Spirit', 'Epic Boon', 'Level 19+', FALSE, 'Increase one ability score by 1 to a maximum of 30, become Invisible in dim light or darkness as a Bonus Action, and gain broad damage Resistance while in dim light or darkness.'),
    ('Boon of Truesight', 'Epic Boon', 'Level 19+', FALSE, 'Increase one ability score by 1 to a maximum of 30, and gain Truesight with a range of 60 feet.');

CREATE TEMP TABLE _import_feat_trait_data (
    feat_name TEXT NOT NULL,
    trait_name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (feat_name, trait_name)
) ON COMMIT DROP;

INSERT INTO _import_feat_trait_data (
    feat_name,
    trait_name,
    description,
    sort_order
) VALUES
    ('Alert', 'Alert: Initiative Proficiency', 'When you roll Initiative, you can add your Proficiency Bonus to the roll.', 10),
    ('Alert', 'Alert: Initiative Swap', 'Immediately after rolling Initiative, you can swap your Initiative with one willing ally in the same combat if neither of you has the Incapacitated condition.', 20),
    ('Magic Initiate', 'Magic Initiate: Spellcasting', 'Choose the Cleric, Druid, or Wizard spell list and a spellcasting ability. You learn two cantrips and one level 1 spell from that list. The level 1 spell is always prepared and can be cast once without a spell slot per Long Rest.', 10),
    ('Magic Initiate', 'Magic Initiate: Spell Change', 'Whenever you gain a new level, you can replace one spell chosen for this feat with another spell of the same level from the chosen spell list.', 20),
    ('Savage Attacker', 'Savage Attacker', 'Once per turn when you hit with a weapon, roll the weapon damage dice twice and use either roll against the target.', 10),
    ('Skilled', 'Skilled', 'Gain proficiency in any combination of three skills or tools.', 10),
    ('Ability Score Improvement', 'Ability Score Improvement', 'Increase one ability score by 2 and another by 1, or increase three ability scores by 1. None can increase above 20.', 10),
    ('Grappler', 'Grappler: Ability Score Increase', 'Increase Strength or Dexterity by 1, to a maximum of 20.', 10),
    ('Grappler', 'Grappler: Punch and Grab', 'Once per turn when you hit with an Unarmed Strike as part of the Attack action, you can use both the Damage and Grapple options.', 20),
    ('Grappler', 'Grappler: Attack Advantage', 'You have Advantage on attack rolls against creatures Grappled by you.', 30),
    ('Grappler', 'Grappler: Fast Wrestler', 'You do not spend extra movement to move a creature Grappled by you if the creature is your size or smaller.', 40),
    ('Archery', 'Archery Fighting Style', 'You gain a +2 bonus to attack rolls you make with ranged weapons.', 10),
    ('Defense', 'Defense Fighting Style', 'While wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.', 10),
    ('Great Weapon Fighting', 'Great Weapon Fighting', 'When rolling damage for a melee weapon held in two hands, treat any 1 or 2 on a damage die as a 3 if the weapon has the Two-Handed or Versatile property.', 10),
    ('Two-Weapon Fighting', 'Two-Weapon Fighting', 'When making the extra attack from the Light property, add your ability modifier to that attack damage if you are not already adding it.', 10),
    ('Boon of Combat Prowess', 'Boon of Combat Prowess: Ability Score Increase', 'Increase one ability score by 1, to a maximum of 30.', 10),
    ('Boon of Combat Prowess', 'Boon of Combat Prowess: Peerless Aim', 'When you miss with an attack roll, you can hit instead. Once used, this refreshes at the start of your next turn.', 20),
    ('Boon of Dimensional Travel', 'Boon of Dimensional Travel: Ability Score Increase', 'Increase one ability score by 1, to a maximum of 30.', 10),
    ('Boon of Dimensional Travel', 'Boon of Dimensional Travel: Blink Steps', 'Immediately after taking the Attack or Magic action, teleport up to 30 feet to an unoccupied space you can see.', 20),
    ('Boon of Fate', 'Boon of Fate: Ability Score Increase', 'Increase one ability score by 1, to a maximum of 30.', 10),
    ('Boon of Fate', 'Boon of Fate: Improve Fate', 'When you or another creature within 60 feet succeeds on or fails a D20 Test, roll 2d4 and apply the total as a bonus or penalty. Refreshes when you roll Initiative or finish a Short or Long Rest.', 20),
    ('Boon of Irresistible Offense', 'Boon of Irresistible Offense: Ability Score Increase', 'Increase Strength or Dexterity by 1, to a maximum of 30.', 10),
    ('Boon of Irresistible Offense', 'Boon of Irresistible Offense: Overcome Defenses', 'Your Bludgeoning, Piercing, and Slashing damage ignores Resistance.', 20),
    ('Boon of Irresistible Offense', 'Boon of Irresistible Offense: Overwhelming Strike', 'When you roll a 20 on an attack roll, deal extra damage equal to the ability score increased by this feat. The extra damage has the attack damage type.', 30),
    ('Boon of Spell Recall', 'Boon of Spell Recall: Ability Score Increase', 'Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.', 10),
    ('Boon of Spell Recall', 'Boon of Spell Recall: Free Casting', 'Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If the roll equals the slot level, the slot is not expended.', 20),
    ('Boon of the Night Spirit', 'Boon of the Night Spirit: Ability Score Increase', 'Increase one ability score by 1, to a maximum of 30.', 10),
    ('Boon of the Night Spirit', 'Boon of the Night Spirit: Merge with Shadows', 'While within dim light or darkness, you can give yourself the Invisible condition as a Bonus Action. It ends immediately after you take an action, Bonus Action, or Reaction.', 20),
    ('Boon of the Night Spirit', 'Boon of the Night Spirit: Shadowy Form', 'While within dim light or darkness, you have Resistance to all damage except Psychic and Radiant.', 30),
    ('Boon of Truesight', 'Boon of Truesight: Ability Score Increase', 'Increase one ability score by 1, to a maximum of 30.', 10),
    ('Boon of Truesight', 'Boon of Truesight: Truesight', 'You have Truesight with a range of 60 feet.', 20);

CREATE TEMP TABLE _import_feat_trait_option_group_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    choice_count INT NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    PRIMARY KEY (trait_name, option_group)
) ON COMMIT DROP;

INSERT INTO _import_feat_trait_option_group_data (
    trait_name,
    option_group,
    choice_count,
    is_required,
    notes
) VALUES
    ('Magic Initiate: Spellcasting', 'Spell List', 1, TRUE, 'Choose the spell list used by this feat.'),
    ('Magic Initiate: Spellcasting', 'Spellcasting Ability', 1, TRUE, 'Choose Intelligence, Wisdom, or Charisma for the spells from this feat.'),
    ('Skilled', 'Skill or Tool Proficiency', 3, TRUE, 'Choose any combination of three skills or tools.'),
    ('Ability Score Improvement', 'Primary Ability Score', 1, TRUE, 'Use this for the +2 ability in +2/+1 mode, or a +1 ability in +1/+1/+1 mode.'),
    ('Ability Score Improvement', 'Secondary Ability Score', 1, TRUE, 'Use this for a +1 ability.'),
    ('Ability Score Improvement', 'Tertiary Ability Score', 1, FALSE, 'Use only when taking three separate +1 increases.'),
    ('Grappler: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose Strength or Dexterity.'),
    ('Boon of Combat Prowess: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose one ability score.'),
    ('Boon of Dimensional Travel: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose one ability score.'),
    ('Boon of Fate: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose one ability score.'),
    ('Boon of Irresistible Offense: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose Strength or Dexterity.'),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose Intelligence, Wisdom, or Charisma.'),
    ('Boon of the Night Spirit: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose one ability score.'),
    ('Boon of Truesight: Ability Score Increase', 'Ability Score', 1, TRUE, 'Choose one ability score.');

CREATE TEMP TABLE _import_feat_spell_choice_group_data (
    trait_name TEXT NOT NULL,
    choice_group TEXT NOT NULL,
    choice_count INT NOT NULL,
    spell_level INT NOT NULL,
    spell_list_option_group TEXT,
    always_prepared BOOLEAN NOT NULL DEFAULT FALSE,
    free_casts_per TEXT,
    notes TEXT,
    PRIMARY KEY (trait_name, choice_group)
) ON COMMIT DROP;

INSERT INTO _import_feat_spell_choice_group_data (
    trait_name,
    choice_group,
    choice_count,
    spell_level,
    spell_list_option_group,
    always_prepared,
    free_casts_per,
    notes
) VALUES
    ('Magic Initiate: Spellcasting', 'Cantrips', 2, 0, 'Spell List', FALSE, NULL, 'Choose two cantrips from the selected spell list.'),
    ('Magic Initiate: Spellcasting', 'Level 1 Spell', 1, 1, 'Spell List', TRUE, 'Long Rest', 'Choose one level 1 spell from the selected spell list. It is always prepared and can be cast once without a spell slot per Long Rest.');

CREATE TEMP TABLE _import_feat_trait_option_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    option_name TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL,
    PRIMARY KEY (trait_name, option_group, option_name)
) ON COMMIT DROP;

INSERT INTO _import_feat_trait_option_data (
    trait_name,
    option_group,
    option_name,
    description,
    sort_order
) VALUES
    ('Magic Initiate: Spellcasting', 'Spell List', 'Cleric', 'Choose cantrips and a level 1 spell from the Cleric spell list.', 10),
    ('Magic Initiate: Spellcasting', 'Spell List', 'Druid', 'Choose cantrips and a level 1 spell from the Druid spell list.', 20),
    ('Magic Initiate: Spellcasting', 'Spell List', 'Wizard', 'Choose cantrips and a level 1 spell from the Wizard spell list.', 30),
    ('Magic Initiate: Spellcasting', 'Spellcasting Ability', 'Intelligence', 'Use Intelligence as the spellcasting ability for this feat.', 10),
    ('Magic Initiate: Spellcasting', 'Spellcasting Ability', 'Wisdom', 'Use Wisdom as the spellcasting ability for this feat.', 20),
    ('Magic Initiate: Spellcasting', 'Spellcasting Ability', 'Charisma', 'Use Charisma as the spellcasting ability for this feat.', 30),
    ('Grappler: Ability Score Increase', 'Ability Score', 'Strength', 'Increase Strength by 1.', 10),
    ('Grappler: Ability Score Increase', 'Ability Score', 'Dexterity', 'Increase Dexterity by 1.', 20),
    ('Boon of Irresistible Offense: Ability Score Increase', 'Ability Score', 'Strength', 'Increase Strength by 1.', 10),
    ('Boon of Irresistible Offense: Ability Score Increase', 'Ability Score', 'Dexterity', 'Increase Dexterity by 1.', 20),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Intelligence', 'Increase Intelligence by 1.', 10),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Wisdom', 'Increase Wisdom by 1.', 20),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Charisma', 'Increase Charisma by 1.', 30);

INSERT INTO _import_feat_trait_option_data (
    trait_name,
    option_group,
    option_name,
    description,
    sort_order
)
SELECT
    trait_name,
    option_group,
    ability_name,
    'Increase ' || ability_name || ' by 1.',
    sort_order
FROM (
    VALUES
        ('Ability Score Improvement', 'Primary Ability Score'),
        ('Ability Score Improvement', 'Secondary Ability Score'),
        ('Ability Score Improvement', 'Tertiary Ability Score'),
        ('Boon of Combat Prowess: Ability Score Increase', 'Ability Score'),
        ('Boon of Dimensional Travel: Ability Score Increase', 'Ability Score'),
        ('Boon of Fate: Ability Score Increase', 'Ability Score'),
        ('Boon of the Night Spirit: Ability Score Increase', 'Ability Score'),
        ('Boon of Truesight: Ability Score Increase', 'Ability Score')
) AS groups(trait_name, option_group)
CROSS JOIN (
    VALUES
        ('Strength', 10),
        ('Dexterity', 20),
        ('Constitution', 30),
        ('Intelligence', 40),
        ('Wisdom', 50),
        ('Charisma', 60)
) AS abilities(ability_name, sort_order)
ON CONFLICT (trait_name, option_group, option_name) DO NOTHING;

CREATE TEMP TABLE _import_feat_option_modifier_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    option_name TEXT NOT NULL,
    choice_mode_key TEXT NOT NULL DEFAULT 'default',
    affected_stat TEXT NOT NULL,
    operation TEXT NOT NULL DEFAULT 'add',
    modifier_value INT,
    max_value INT,
    scope_text TEXT,
    PRIMARY KEY (
        trait_name,
        option_group,
        option_name,
        choice_mode_key,
        affected_stat,
        operation
    )
) ON COMMIT DROP;

INSERT INTO _import_feat_option_modifier_data (
    trait_name,
    option_group,
    option_name,
    choice_mode_key,
    affected_stat,
    operation,
    modifier_value,
    max_value,
    scope_text
)
SELECT
    trait_name,
    option_group,
    ability_name,
    choice_mode_key,
    affected_stat,
    'add',
    modifier_value,
    max_value,
    scope_text
FROM (
    VALUES
        ('Ability Score Improvement', 'Primary Ability Score', 'plus_two_plus_one', 2, 20, 'Primary ability in +2/+1 mode.'),
        ('Ability Score Improvement', 'Secondary Ability Score', 'plus_two_plus_one', 1, 20, 'Secondary ability in +2/+1 mode.'),
        ('Ability Score Improvement', 'Primary Ability Score', 'triple_plus_one', 1, 20, 'Primary ability in +1/+1/+1 mode.'),
        ('Ability Score Improvement', 'Secondary Ability Score', 'triple_plus_one', 1, 20, 'Secondary ability in +1/+1/+1 mode.'),
        ('Ability Score Improvement', 'Tertiary Ability Score', 'triple_plus_one', 1, 20, 'Tertiary ability in +1/+1/+1 mode.')
) AS asi_groups(trait_name, option_group, choice_mode_key, modifier_value, max_value, scope_text)
CROSS JOIN (
    VALUES
        ('Strength', 'strength'),
        ('Dexterity', 'dexterity'),
        ('Constitution', 'constitution'),
        ('Intelligence', 'intelligence'),
        ('Wisdom', 'wisdom'),
        ('Charisma', 'charisma')
) AS abilities(ability_name, affected_stat)
ON CONFLICT (
    trait_name,
    option_group,
    option_name,
    choice_mode_key,
    affected_stat,
    operation
) DO NOTHING;

INSERT INTO _import_feat_option_modifier_data (
    trait_name,
    option_group,
    option_name,
    affected_stat,
    operation,
    modifier_value,
    max_value,
    scope_text
)
SELECT
    trait_name,
    'Ability Score',
    ability_name,
    affected_stat,
    'add',
    1,
    max_value,
    'Ability score increase from selected feat option.'
FROM (
    VALUES
        ('Grappler: Ability Score Increase', 20),
        ('Boon of Combat Prowess: Ability Score Increase', 30),
        ('Boon of Dimensional Travel: Ability Score Increase', 30),
        ('Boon of Fate: Ability Score Increase', 30),
        ('Boon of the Night Spirit: Ability Score Increase', 30),
        ('Boon of Truesight: Ability Score Increase', 30)
) AS groups(trait_name, max_value)
CROSS JOIN (
    VALUES
        ('Strength', 'strength'),
        ('Dexterity', 'dexterity'),
        ('Constitution', 'constitution'),
        ('Intelligence', 'intelligence'),
        ('Wisdom', 'wisdom'),
        ('Charisma', 'charisma')
) AS abilities(ability_name, affected_stat)
ON CONFLICT (
    trait_name,
    option_group,
    option_name,
    choice_mode_key,
    affected_stat,
    operation
) DO NOTHING;

INSERT INTO _import_feat_option_modifier_data (
    trait_name,
    option_group,
    option_name,
    affected_stat,
    operation,
    modifier_value,
    max_value,
    scope_text
) VALUES
    ('Boon of Irresistible Offense: Ability Score Increase', 'Ability Score', 'Strength', 'strength', 'add', 1, 30, 'Ability score increase from selected feat option.'),
    ('Boon of Irresistible Offense: Ability Score Increase', 'Ability Score', 'Dexterity', 'dexterity', 'add', 1, 30, 'Ability score increase from selected feat option.'),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Intelligence', 'intelligence', 'add', 1, 30, 'Ability score increase from selected feat option.'),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Wisdom', 'wisdom', 'add', 1, 30, 'Ability score increase from selected feat option.'),
    ('Boon of Spell Recall: Ability Score Increase', 'Ability Score', 'Charisma', 'charisma', 'add', 1, 30, 'Ability score increase from selected feat option.')
ON CONFLICT (
    trait_name,
    option_group,
    option_name,
    choice_mode_key,
    affected_stat,
    operation
) DO NOTHING;

CREATE TEMP TABLE _import_feat_effect_data (
    trait_name TEXT NOT NULL,
    effect_name TEXT NOT NULL,
    description TEXT,
    effect_type TEXT NOT NULL,
    duration_text TEXT,
    requires_choice BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (trait_name, effect_name)
) ON COMMIT DROP;

INSERT INTO _import_feat_effect_data (
    trait_name,
    effect_name,
    description,
    effect_type,
    duration_text,
    requires_choice
) VALUES
    ('Alert: Initiative Proficiency', 'Alert: Initiative Proficiency', 'Add your Proficiency Bonus to Initiative rolls.', 'modifier', NULL, FALSE),
    ('Alert: Initiative Swap', 'Alert: Initiative Swap', 'After rolling Initiative, swap Initiative with one willing ally in the same combat if neither of you is Incapacitated.', 'special', NULL, FALSE),
    ('Magic Initiate: Spellcasting', 'Magic Initiate: Spellcasting', 'Choose a spell list, spellcasting ability, two cantrips, and one level 1 spell. Track the chosen spells in character_spells.', 'special', NULL, TRUE),
    ('Savage Attacker', 'Savage Attacker', 'Once per turn on a weapon hit, roll weapon damage dice twice and use either roll.', 'special', NULL, FALSE),
    ('Skilled', 'Skilled Proficiencies', 'Choose three skill or tool proficiencies.', 'proficiency', NULL, TRUE),
    ('Ability Score Improvement', 'Ability Score Improvement', 'Choose the ability scores increased by this feat.', 'special', NULL, TRUE),
    ('Grappler: Punch and Grab', 'Grappler: Punch and Grab', 'Once per turn when hitting with an Unarmed Strike as part of the Attack action, use both Damage and Grapple.', 'special', NULL, FALSE),
    ('Grappler: Attack Advantage', 'Grappler: Attack Advantage', 'Advantage on attacks against creatures Grappled by you.', 'modifier', NULL, FALSE),
    ('Grappler: Fast Wrestler', 'Grappler: Fast Wrestler', 'No extra movement cost to move a creature Grappled by you if it is your size or smaller.', 'special', NULL, FALSE),
    ('Archery Fighting Style', 'Archery Fighting Style', '+2 bonus to ranged weapon attack rolls.', 'modifier', NULL, FALSE),
    ('Defense Fighting Style', 'Defense Fighting Style', '+1 Armor Class while wearing Light, Medium, or Heavy armor.', 'modifier', NULL, FALSE),
    ('Great Weapon Fighting', 'Great Weapon Fighting', 'Treat 1 or 2 on damage dice as 3 for qualifying melee weapons held in two hands.', 'special', NULL, FALSE),
    ('Two-Weapon Fighting', 'Two-Weapon Fighting', 'Add ability modifier to the Light property extra attack damage when you are not already adding it.', 'special', NULL, FALSE),
    ('Boon of Combat Prowess: Peerless Aim', 'Boon of Combat Prowess: Peerless Aim', 'Turn a missed attack roll into a hit once before refreshing at the start of your next turn.', 'special', NULL, FALSE),
    ('Boon of Dimensional Travel: Blink Steps', 'Boon of Dimensional Travel: Blink Steps', 'After taking the Attack or Magic action, teleport up to 30 feet to an unoccupied space you can see.', 'special', NULL, FALSE),
    ('Boon of Fate: Improve Fate', 'Boon of Fate: Improve Fate', 'Apply 2d4 as a bonus or penalty to a nearby D20 Test, refreshing on Initiative or a Short or Long Rest.', 'special', NULL, FALSE),
    ('Boon of Irresistible Offense: Overcome Defenses', 'Boon of Irresistible Offense: Overcome Defenses', 'Bludgeoning, Piercing, and Slashing damage you deal ignores Resistance.', 'special', NULL, FALSE),
    ('Boon of Irresistible Offense: Overwhelming Strike', 'Boon of Irresistible Offense: Overwhelming Strike', 'On a natural 20 attack roll, deal extra damage equal to the ability score increased by this feat.', 'special', NULL, FALSE),
    ('Boon of Spell Recall: Free Casting', 'Boon of Spell Recall: Free Casting', 'When casting with a level 1-4 spell slot, roll 1d4; if it equals the slot level, the slot is not expended.', 'special', NULL, FALSE),
    ('Boon of the Night Spirit: Merge with Shadows', 'Boon of the Night Spirit: Merge with Shadows', 'In dim light or darkness, gain the Invisible condition as a Bonus Action until you take an action, Bonus Action, or Reaction.', 'special', NULL, FALSE),
    ('Boon of the Night Spirit: Shadowy Form', 'Boon of the Night Spirit: Shadowy Form', 'In dim light or darkness, gain Resistance to all damage except Psychic and Radiant.', 'special', NULL, FALSE),
    ('Boon of Truesight: Truesight', 'Boon of Truesight: Truesight', 'Gain Truesight with a range of 60 feet.', 'modifier', NULL, FALSE);

CREATE TEMP TABLE _import_feat_effect_modifier_data (
    effect_name TEXT NOT NULL,
    affected_stat TEXT NOT NULL,
    operation TEXT NOT NULL,
    modifier_value INT,
    PRIMARY KEY (effect_name, affected_stat, operation)
) ON COMMIT DROP;

INSERT INTO _import_feat_effect_modifier_data (
    effect_name,
    affected_stat,
    operation,
    modifier_value
) VALUES
    ('Grappler: Attack Advantage', 'attack_rolls_against_grappled_by_you', 'advantage', NULL),
    ('Archery Fighting Style', 'ranged_weapon_attack_roll', 'add', 2),
    ('Defense Fighting Style', 'armor_class_when_wearing_armor', 'add', 1),
    ('Alert: Initiative Proficiency', 'initiative', 'add', 0),
    ('Boon of Truesight: Truesight', 'truesight_range', 'set', 60);

CREATE TEMP TABLE _import_feat_effect_proficiency_data (
    effect_name TEXT NOT NULL,
    proficiency_type TEXT NOT NULL,
    name TEXT,
    requires_choice BOOLEAN NOT NULL DEFAULT FALSE,
    choice_count INT NOT NULL DEFAULT 1,
    notes TEXT,
    PRIMARY KEY (effect_name, proficiency_type)
) ON COMMIT DROP;

INSERT INTO damage_types (name) VALUES
    ('Acid'),
    ('Bludgeoning'),
    ('Cold'),
    ('Fire'),
    ('Force'),
    ('Lightning'),
    ('Necrotic'),
    ('Piercing'),
    ('Poison'),
    ('Psychic'),
    ('Radiant'),
    ('Slashing'),
    ('Thunder')
ON CONFLICT (name) DO NOTHING;

INSERT INTO statuses (
    name,
    description
) VALUES
    ('Invisible', 'Cannot be seen without special senses or magic, and gains benefits against creatures that cannot see it.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

CREATE TEMP TABLE _import_feat_effect_status_data (
    effect_name TEXT NOT NULL,
    status_name TEXT NOT NULL,
    duration_text TEXT,
    scope_text TEXT,
    PRIMARY KEY (effect_name, status_name)
) ON COMMIT DROP;

INSERT INTO _import_feat_effect_status_data (
    effect_name,
    status_name,
    duration_text,
    scope_text
) VALUES
    ('Boon of the Night Spirit: Merge with Shadows', 'Invisible', 'Until you take an action, Bonus Action, or Reaction.', 'You must be within dim light or darkness and use a Bonus Action.');

CREATE TEMP TABLE _import_feat_damage_adjustment_data (
    effect_name TEXT NOT NULL,
    damage_type TEXT NOT NULL,
    adjustment_type TEXT NOT NULL,
    scope_text TEXT,
    PRIMARY KEY (effect_name, damage_type, adjustment_type)
) ON COMMIT DROP;

INSERT INTO _import_feat_damage_adjustment_data (
    effect_name,
    damage_type,
    adjustment_type,
    scope_text
) VALUES
    ('Boon of the Night Spirit: Shadowy Form', 'Acid', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Bludgeoning', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Cold', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Fire', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Force', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Lightning', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Necrotic', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Piercing', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Poison', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Slashing', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.'),
    ('Boon of the Night Spirit: Shadowy Form', 'Thunder', 'resistance', 'While within dim light or darkness. Does not apply to Psychic or Radiant damage.');

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
FROM _import_feat_data
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    prerequisite_text = EXCLUDED.prerequisite_text,
    is_repeatable = EXCLUDED.is_repeatable,
    description = EXCLUDED.description;

INSERT INTO traits (
    name,
    description
)
SELECT DISTINCT ON (trait_name)
    trait_name,
    description
FROM _import_feat_trait_data
ORDER BY trait_name, description
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

INSERT INTO feat_traits (
    feat_id,
    trait_id
)
SELECT
    f.id,
    t.id
FROM _import_feat_trait_data ftd
JOIN feats f ON f.name = ftd.feat_name
JOIN traits t ON t.name = ftd.trait_name
ON CONFLICT (feat_id, trait_id) DO NOTHING;

INSERT INTO trait_option_groups (
    trait_id,
    option_group,
    choice_count,
    is_required,
    notes
)
SELECT
    t.id,
    og.option_group,
    og.choice_count,
    og.is_required,
    og.notes
FROM _import_feat_trait_option_group_data og
JOIN traits t ON t.name = og.trait_name
ON CONFLICT (trait_id, option_group) DO UPDATE SET
    choice_count = EXCLUDED.choice_count,
    is_required = EXCLUDED.is_required,
    notes = EXCLUDED.notes;

INSERT INTO trait_spell_choice_groups (
    trait_id,
    choice_group,
    choice_count,
    spell_level,
    spell_list_option_group,
    always_prepared,
    free_casts_per,
    notes
)
SELECT
    t.id,
    scg.choice_group,
    scg.choice_count,
    scg.spell_level,
    scg.spell_list_option_group,
    scg.always_prepared,
    scg.free_casts_per,
    scg.notes
FROM _import_feat_spell_choice_group_data scg
JOIN traits t ON t.name = scg.trait_name
ON CONFLICT (trait_id, choice_group) DO UPDATE SET
    choice_count = EXCLUDED.choice_count,
    spell_level = EXCLUDED.spell_level,
    spell_list_option_group = EXCLUDED.spell_list_option_group,
    always_prepared = EXCLUDED.always_prepared,
    free_casts_per = EXCLUDED.free_casts_per,
    notes = EXCLUDED.notes;

INSERT INTO trait_options (
    trait_id,
    option_group,
    name,
    description,
    sort_order
)
SELECT
    t.id,
    ot.option_group,
    ot.option_name,
    ot.description,
    ot.sort_order
FROM _import_feat_trait_option_data ot
JOIN traits t ON t.name = ot.trait_name
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

UPDATE trait_options tro
SET spell_list_id = sl.id
FROM traits t,
     spell_lists sl
WHERE tro.trait_id = t.id
  AND t.name = 'Magic Initiate: Spellcasting'
  AND tro.option_group = 'Spell List'
  AND sl.name = tro.name
  AND tro.name IN ('Cleric', 'Druid', 'Wizard');

INSERT INTO trait_option_modifiers (
    trait_option_id,
    trait_id,
    choice_mode_key,
    affected_stat,
    operation,
    modifier_value,
    max_value,
    scope_text
)
SELECT
    tro.id,
    t.id,
    om.choice_mode_key,
    om.affected_stat,
    om.operation,
    om.modifier_value,
    om.max_value,
    om.scope_text
FROM _import_feat_option_modifier_data om
JOIN traits t ON t.name = om.trait_name
JOIN trait_options tro ON tro.trait_id = t.id
    AND tro.option_group = om.option_group
    AND tro.name = om.option_name
ON CONFLICT (
    trait_option_id,
    choice_mode_key,
    affected_stat,
    operation
) DO UPDATE SET
    modifier_value = EXCLUDED.modifier_value,
    max_value = EXCLUDED.max_value,
    scope_text = EXCLUDED.scope_text;

WITH skilled_trait AS (
    SELECT id
    FROM traits
    WHERE name = 'Skilled'
),
skill_options AS (
    SELECT
        id AS skill_id,
        name,
        'Gain proficiency in the ' || name || ' skill.' AS description,
        (100 + row_number() OVER (ORDER BY name))::INT AS sort_order
    FROM skills
)
INSERT INTO trait_options (
    trait_id,
    option_group,
    skill_id,
    name,
    description,
    sort_order
)
SELECT
    skilled_trait.id,
    'Skill or Tool Proficiency',
    skill_options.skill_id,
    skill_options.name,
    skill_options.description,
    skill_options.sort_order
FROM skilled_trait
CROSS JOIN skill_options
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    tool_id = NULL,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

WITH skilled_trait AS (
    SELECT id
    FROM traits
    WHERE name = 'Skilled'
),
tool_options AS (
    SELECT
        id AS tool_id,
        name,
        'Gain proficiency with ' || name || '.' AS description,
        (1000 + row_number() OVER (ORDER BY category, name))::INT AS sort_order
    FROM tools
)
INSERT INTO trait_options (
    trait_id,
    option_group,
    tool_id,
    name,
    description,
    sort_order
)
SELECT
    skilled_trait.id,
    'Skill or Tool Proficiency',
    tool_options.tool_id,
    tool_options.name,
    tool_options.description,
    tool_options.sort_order
FROM skilled_trait
CROSS JOIN tool_options
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    skill_id = NULL,
    tool_id = EXCLUDED.tool_id,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO effects (
    trait_id,
    name,
    description,
    effect_type,
    duration_text,
    requires_choice
)
SELECT
    t.id,
    ed.effect_name,
    ed.description,
    ed.effect_type,
    ed.duration_text,
    ed.requires_choice
FROM _import_feat_effect_data ed
JOIN traits t ON t.name = ed.trait_name
WHERE NOT EXISTS (
    SELECT 1
    FROM effects e
    WHERE e.trait_id = t.id
      AND e.name = ed.effect_name
);

UPDATE effects e
SET
    description = ed.description,
    effect_type = ed.effect_type,
    duration_text = ed.duration_text,
    requires_choice = ed.requires_choice
FROM _import_feat_effect_data ed
JOIN traits t ON t.name = ed.trait_name
WHERE e.trait_id = t.id
  AND e.name = ed.effect_name;

CREATE TEMP TABLE _import_feat_effects ON COMMIT DROP AS
SELECT
    e.id AS effect_id,
    ed.effect_name
FROM _import_feat_effect_data ed
JOIN traits t ON t.name = ed.trait_name
JOIN effects e ON e.trait_id = t.id
    AND e.name = ed.effect_name;

INSERT INTO effect_statuses (
    effect_id,
    status_id,
    duration_text,
    scope_text
)
SELECT
    efe.effect_id,
    s.id,
    es.duration_text,
    es.scope_text
FROM _import_feat_effect_status_data es
JOIN _import_feat_effects efe ON efe.effect_name = es.effect_name
JOIN statuses s ON s.name = es.status_name
ON CONFLICT (effect_id, status_id) DO UPDATE SET
    duration_text = EXCLUDED.duration_text,
    scope_text = EXCLUDED.scope_text;

DELETE FROM effect_damage_adjustments eda
USING _import_feat_effects efe,
      _import_feat_damage_adjustment_data da
WHERE eda.effect_id = efe.effect_id
  AND efe.effect_name = da.effect_name;

INSERT INTO effect_damage_adjustments (
    effect_id,
    damage_type_id,
    adjustment_type,
    scope_text
)
SELECT
    efe.effect_id,
    dt.id,
    da.adjustment_type,
    da.scope_text
FROM _import_feat_damage_adjustment_data da
JOIN _import_feat_effects efe ON efe.effect_name = da.effect_name
JOIN damage_types dt ON dt.name = da.damage_type;

INSERT INTO effect_modifiers (
    effect_id,
    affected_stat,
    operation,
    modifier_value
)
SELECT
    efe.effect_id,
    em.affected_stat,
    em.operation,
    em.modifier_value
FROM _import_feat_effect_modifier_data em
JOIN _import_feat_effects efe ON efe.effect_name = em.effect_name
ON CONFLICT (effect_id, affected_stat, operation) DO UPDATE SET
    modifier_value = EXCLUDED.modifier_value;

DELETE FROM effect_proficiencies ep
USING _import_feat_effects efe
WHERE ep.effect_id = efe.effect_id;

INSERT INTO effect_proficiencies (
    effect_id,
    proficiency_type,
    name,
    requires_choice,
    choice_count,
    notes
)
SELECT
    efe.effect_id,
    ep.proficiency_type,
    ep.name,
    ep.requires_choice,
    ep.choice_count,
    ep.notes
FROM _import_feat_effect_proficiency_data ep
JOIN _import_feat_effects efe ON efe.effect_name = ep.effect_name;

COMMIT;
