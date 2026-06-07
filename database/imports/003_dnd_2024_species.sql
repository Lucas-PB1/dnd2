BEGIN;

-- D&D 2024 / SRD 5.2.1 species catalog.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
-- Choice-based traits use trait_option_groups and trait_options where the
-- rules expose selectable lineages, ancestries, skills, and spell packages.
CREATE TEMP TABLE _import_species_data (
    name TEXT PRIMARY KEY,
    description TEXT,
    creature_type TEXT NOT NULL,
    size_options TEXT NOT NULL,
    base_speed INT NOT NULL
) ON COMMIT DROP;

INSERT INTO _import_species_data (
    name,
    description,
    creature_type,
    size_options,
    base_speed
) VALUES
    ('Aasimar', 'Humanoids touched by celestial power, with radiant or necrotic revelation, healing, and celestial resistance.', 'Humanoid', 'Small or Medium', 30),
    ('Dragonborn', 'Humanoids with draconic ancestry whose breath weapon and resistance come from a chosen dragon ancestor.', 'Humanoid', 'Medium', 30),
    ('Dwarf', 'Stout humanoids with exceptional resilience, deep ties to stone, and a naturally tough body.', 'Humanoid', 'Medium', 30),
    ('Elf', 'Humanoids with fey ancestry, keen senses, trance meditation, and a chosen magical lineage.', 'Humanoid', 'Medium', 30),
    ('Gnome', 'Small humanoids with magical cleverness and a chosen lineage tied to forest or rock gnomes.', 'Humanoid', 'Small', 30),
    ('Goliath', 'Powerful humanoids descended from giants, with giant ancestry boons and a faster stride.', 'Humanoid', 'Medium', 35),
    ('Halfling', 'Small humanoids known for bravery, luck, nimble movement, and natural stealth among larger creatures.', 'Humanoid', 'Small', 30),
    ('Human', 'Versatile humanoids who gain extra inspiration, a skill proficiency, and an Origin feat.', 'Humanoid', 'Small or Medium', 30),
    ('Orc', 'Strong humanoids with endurance, darkvision, and bursts of adrenaline in dangerous moments.', 'Humanoid', 'Medium', 30),
    ('Tiefling', 'Humanoids marked by fiendish legacies that grant supernatural magic and planar resistance.', 'Humanoid', 'Small or Medium', 30);

CREATE TEMP TABLE _import_species_trait_data (
    species_name TEXT NOT NULL,
    trait_name TEXT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (species_name, trait_name)
) ON COMMIT DROP;

INSERT INTO _import_species_trait_data (
    species_name,
    trait_name,
    description
) VALUES
    ('Aasimar', 'Celestial Resistance', 'You have Resistance to Necrotic damage and Radiant damage.'),
    ('Aasimar', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.'),
    ('Aasimar', 'Healing Hands', 'As a Magic action, touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains Hit Points equal to the total rolled. Once used, this refreshes on a Long Rest.'),
    ('Aasimar', 'Light Bearer', 'You know the Light cantrip. Charisma is your spellcasting ability for it.'),
    ('Aasimar', 'Celestial Revelation', 'Starting at character level 3, transform as a Bonus Action for 1 minute, choosing Heavenly Wings, Inner Radiance, or Necrotic Shroud each time. Once used, this refreshes on a Long Rest.'),
    ('Dragonborn', 'Draconic Ancestry', 'Choose a dragon ancestor: Black or Copper for Acid, Blue or Bronze for Lightning, Brass, Gold, or Red for Fire, Green for Poison, or Silver or White for Cold. This choice affects breath weapon, resistance, and appearance.'),
    ('Dragonborn', 'Breath Weapon', 'When taking the Attack action, replace one attack with a 15-foot Cone or 30-foot Line. Creatures make a Dexterity save against 8 + Constitution modifier + Proficiency Bonus, taking 1d10 ancestry damage on a failed save or half on success. Damage scales to 2d10 at level 5, 3d10 at level 11, and 4d10 at level 17. Uses equal Proficiency Bonus per Long Rest.'),
    ('Dragonborn', 'Draconic Damage Resistance', 'You have Resistance to the damage type chosen with Draconic Ancestry.'),
    ('Dragonborn', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.'),
    ('Dragonborn', 'Draconic Flight', 'Starting at character level 5, use a Bonus Action once per Long Rest to gain spectral wings and a Fly Speed equal to your Speed for 10 minutes, ending early if retracted or if you have the Incapacitated condition.'),
    ('Dwarf', 'Darkvision (120 ft)', 'You can see in darkness within 120 feet.'),
    ('Dwarf', 'Dwarven Resilience', 'You have Resistance to Poison damage and Advantage on saving throws made to avoid or end the Poisoned condition.'),
    ('Dwarf', 'Dwarven Toughness', 'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.'),
    ('Dwarf', 'Stonecunning', 'As a Bonus Action while touching stone or standing on a stone surface, gain Tremorsense with a range of 60 feet for 10 minutes. Uses equal Proficiency Bonus per Long Rest.'),
    ('Elf', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.'),
    ('Elf', 'Elven Lineage', 'Choose Drow, High Elf, or Wood Elf. Drow improves Darkvision to 120 feet and grants Dancing Lights, then Faerie Fire and Darkness. High Elf grants Prestidigitation, then Detect Magic and Misty Step, and can replace the cantrip after a Long Rest. Wood Elf increases Speed to 35 feet and grants Druidcraft, then Longstrider and Pass without Trace. Intelligence, Wisdom, or Charisma is chosen as the spellcasting ability.'),
    ('Elf', 'Fey Ancestry', 'You have Advantage on saving throws made to avoid or end the Charmed condition.'),
    ('Elf', 'Keen Senses', 'You gain proficiency in one of these skills: Insight, Perception, or Survival.'),
    ('Elf', 'Trance', 'You do not need to sleep, magic cannot put you to sleep, and you can finish a Long Rest in 4 hours of conscious meditation.'),
    ('Gnome', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.'),
    ('Gnome', 'Gnomish Cunning', 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.'),
    ('Gnome', 'Gnomish Lineage', 'Choose Forest Gnome or Rock Gnome. Forest Gnome grants Minor Illusion and Speak with Animals, with free uses of Speak with Animals equal to Proficiency Bonus per Long Rest. Rock Gnome grants Mending and Prestidigitation and can use Prestidigitation over 10 minutes to create temporary Tiny clockwork devices. Intelligence, Wisdom, or Charisma is chosen as the spellcasting ability.'),
    ('Goliath', 'Giant Ancestry', 'Choose one giant ancestry boon, usable a number of times equal to Proficiency Bonus per Long Rest: Cloud teleports up to 30 feet as a Bonus Action; Fire adds 1d10 Fire damage on a damaging hit; Frost adds 1d6 Cold damage and slows the target by 10 feet; Hill can knock a Large or smaller target Prone after a damaging hit; Stone reduces damage by 1d12 + Constitution modifier as a Reaction; Storm deals 1d8 Thunder damage to a nearby damaging creature as a Reaction.'),
    ('Goliath', 'Large Form', 'Starting at character level 5, use a Bonus Action once per Long Rest to become Large for 10 minutes if space allows. During the transformation, you have Advantage on Strength checks and your Speed increases by 10 feet.'),
    ('Goliath', 'Powerful Build', 'You have Advantage on checks made to end the Grappled condition and count as one size larger for carrying capacity.'),
    ('Halfling', 'Brave', 'You have Advantage on saving throws made to avoid or end the Frightened condition.'),
    ('Halfling', 'Halfling Nimbleness', 'You can move through the space of creatures larger than you, but cannot stop in the same space.'),
    ('Halfling', 'Luck', 'When you roll a 1 on the d20 of a D20 Test, you can reroll it and must use the new roll.'),
    ('Halfling', 'Naturally Stealthy', 'You can take the Hide action when obscured only by a creature that is at least one size larger than you.'),
    ('Human', 'Resourceful', 'You gain Heroic Inspiration whenever you finish a Long Rest.'),
    ('Human', 'Skillful', 'You gain proficiency in one skill of your choice.'),
    ('Human', 'Versatile', 'You gain one Origin feat of your choice. Skilled is recommended.'),
    ('Orc', 'Adrenaline Rush', 'You can take the Dash action as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus when you do. Uses equal Proficiency Bonus per Short or Long Rest.'),
    ('Orc', 'Darkvision (120 ft)', 'You can see in darkness within 120 feet.'),
    ('Orc', 'Relentless Endurance', 'When reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once used, it refreshes on a Long Rest.'),
    ('Tiefling', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.'),
    ('Tiefling', 'Fiendish Legacy', 'Choose Abyssal, Chthonic, or Infernal. Abyssal grants Poison resistance and Poison Spray, then Ray of Sickness and Hold Person. Chthonic grants Necrotic resistance and Chill Touch, then False Life and Ray of Enfeeblement. Infernal grants Fire resistance and Fire Bolt, then Hellish Rebuke and Darkness. Intelligence, Wisdom, or Charisma is chosen as the spellcasting ability.'),
    ('Tiefling', 'Otherworldly Presence', 'You know Thaumaturgy, using the same spellcasting ability chosen for Fiendish Legacy.');

CREATE TEMP TABLE _import_trait_option_group_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    choice_count INT NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    PRIMARY KEY (trait_name, option_group)
) ON COMMIT DROP;

INSERT INTO _import_trait_option_group_data (
    trait_name,
    option_group,
    choice_count,
    is_required,
    notes
) VALUES
    ('Celestial Revelation', 'Revelation', 1, TRUE, 'Choose one revelation option each time you transform.'),
    ('Draconic Ancestry', 'Dragon Ancestor', 1, TRUE, 'Choose one dragon ancestor.'),
    ('Elven Lineage', 'Lineage', 1, TRUE, 'Choose one elven lineage.'),
    ('Keen Senses', 'Skill Proficiency', 1, TRUE, 'Choose Insight, Perception, or Survival.'),
    ('Gnomish Lineage', 'Lineage', 1, TRUE, 'Choose one gnomish lineage.'),
    ('Giant Ancestry', 'Giant Ancestry', 1, TRUE, 'Choose one giant ancestry boon.'),
    ('Skillful', 'Skill Proficiency', 1, TRUE, 'Choose one skill proficiency.'),
    ('Fiendish Legacy', 'Legacy', 1, TRUE, 'Choose one fiendish legacy.');

CREATE TEMP TABLE _import_trait_option_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    option_name TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL,
    PRIMARY KEY (trait_name, option_group, option_name)
) ON COMMIT DROP;

INSERT INTO _import_trait_option_data (
    trait_name,
    option_group,
    option_name,
    description,
    sort_order
) VALUES
    ('Celestial Revelation', 'Revelation', 'Heavenly Wings', 'Gain a Fly Speed equal to your Speed during the transformation.', 10),
    ('Celestial Revelation', 'Revelation', 'Inner Radiance', 'Shed light and deal Radiant damage equal to your Proficiency Bonus to nearby creatures at the end of your turns during the transformation.', 20),
    ('Celestial Revelation', 'Revelation', 'Necrotic Shroud', 'Nearby creatures other than your allies can gain the Frightened condition until the end of your next turn when you transform.', 30),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Black', 'Acid damage ancestry.', 10),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Blue', 'Lightning damage ancestry.', 20),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Brass', 'Fire damage ancestry.', 30),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Bronze', 'Lightning damage ancestry.', 40),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Copper', 'Acid damage ancestry.', 50),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Gold', 'Fire damage ancestry.', 60),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Green', 'Poison damage ancestry.', 70),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Red', 'Fire damage ancestry.', 80),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Silver', 'Cold damage ancestry.', 90),
    ('Draconic Ancestry', 'Dragon Ancestor', 'White', 'Cold damage ancestry.', 100),
    ('Elven Lineage', 'Lineage', 'Drow', 'Darkvision increases to 120 feet, and you gain Drow lineage spells.', 10),
    ('Elven Lineage', 'Lineage', 'High Elf', 'You gain High Elf lineage spells and can replace the lineage cantrip after a Long Rest.', 20),
    ('Elven Lineage', 'Lineage', 'Wood Elf', 'Your Speed increases to 35 feet, and you gain Wood Elf lineage spells.', 30),
    ('Gnomish Lineage', 'Lineage', 'Forest Gnome', 'You gain Minor Illusion and Speak with Animals magic.', 10),
    ('Gnomish Lineage', 'Lineage', 'Rock Gnome', 'You gain Mending, Prestidigitation, and the ability to create temporary Tiny clockwork devices.', 20),
    ('Giant Ancestry', 'Giant Ancestry', 'Cloud Giant', 'Cloud''s Jaunt: teleport up to 30 feet as a Bonus Action.', 10),
    ('Giant Ancestry', 'Giant Ancestry', 'Fire Giant', 'Fire''s Burn: add 1d10 Fire damage when you hit and deal damage.', 20),
    ('Giant Ancestry', 'Giant Ancestry', 'Frost Giant', 'Frost''s Chill: add 1d6 Cold damage and reduce the target Speed by 10 feet.', 30),
    ('Giant Ancestry', 'Giant Ancestry', 'Hill Giant', 'Hill''s Tumble: give a Large or smaller target the Prone condition after a damaging hit.', 40),
    ('Giant Ancestry', 'Giant Ancestry', 'Stone Giant', 'Stone''s Endurance: reduce damage by 1d12 + Constitution modifier as a Reaction.', 50),
    ('Giant Ancestry', 'Giant Ancestry', 'Storm Giant', 'Storm''s Thunder: deal 1d8 Thunder damage to a nearby creature that damages you.', 60),
    ('Fiendish Legacy', 'Legacy', 'Abyssal', 'Poison resistance and Abyssal legacy spells.', 10),
    ('Fiendish Legacy', 'Legacy', 'Chthonic', 'Necrotic resistance and Chthonic legacy spells.', 20),
    ('Fiendish Legacy', 'Legacy', 'Infernal', 'Fire resistance and Infernal legacy spells.', 30);

CREATE TEMP TABLE _import_trait_option_spell_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    option_name TEXT NOT NULL,
    spell_name TEXT NOT NULL,
    level_required INT NOT NULL,
    free_casts_per TEXT,
    notes TEXT,
    PRIMARY KEY (trait_name, option_group, option_name, spell_name, level_required)
) ON COMMIT DROP;

INSERT INTO _import_trait_option_spell_data (
    trait_name,
    option_group,
    option_name,
    spell_name,
    level_required,
    free_casts_per,
    notes
) VALUES
    ('Elven Lineage', 'Lineage', 'Drow', 'Dancing Lights', 1, NULL, 'Cantrip granted by Drow lineage.'),
    ('Elven Lineage', 'Lineage', 'Drow', 'Faerie Fire', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Elven Lineage', 'Lineage', 'Drow', 'Darkness', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Elven Lineage', 'Lineage', 'High Elf', 'Prestidigitation', 1, NULL, 'Cantrip granted by High Elf lineage; can be replaced after a Long Rest.'),
    ('Elven Lineage', 'Lineage', 'High Elf', 'Detect Magic', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Elven Lineage', 'Lineage', 'High Elf', 'Misty Step', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Elven Lineage', 'Lineage', 'Wood Elf', 'Druidcraft', 1, NULL, 'Cantrip granted by Wood Elf lineage.'),
    ('Elven Lineage', 'Lineage', 'Wood Elf', 'Longstrider', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Elven Lineage', 'Lineage', 'Wood Elf', 'Pass without Trace', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Gnomish Lineage', 'Lineage', 'Forest Gnome', 'Minor Illusion', 1, NULL, 'Cantrip granted by Forest Gnome lineage.'),
    ('Gnomish Lineage', 'Lineage', 'Forest Gnome', 'Speak with Animals', 1, 'Long Rest', 'Always prepared; free uses equal Proficiency Bonus per Long Rest.'),
    ('Gnomish Lineage', 'Lineage', 'Rock Gnome', 'Mending', 1, NULL, 'Cantrip granted by Rock Gnome lineage.'),
    ('Gnomish Lineage', 'Lineage', 'Rock Gnome', 'Prestidigitation', 1, NULL, 'Cantrip granted by Rock Gnome lineage.'),
    ('Fiendish Legacy', 'Legacy', 'Abyssal', 'Poison Spray', 1, NULL, 'Cantrip granted by Abyssal legacy.'),
    ('Fiendish Legacy', 'Legacy', 'Abyssal', 'Ray of Sickness', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Fiendish Legacy', 'Legacy', 'Abyssal', 'Hold Person', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Fiendish Legacy', 'Legacy', 'Chthonic', 'Chill Touch', 1, NULL, 'Cantrip granted by Chthonic legacy.'),
    ('Fiendish Legacy', 'Legacy', 'Chthonic', 'False Life', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Fiendish Legacy', 'Legacy', 'Chthonic', 'Ray of Enfeeblement', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Fiendish Legacy', 'Legacy', 'Infernal', 'Fire Bolt', 1, NULL, 'Cantrip granted by Infernal legacy.'),
    ('Fiendish Legacy', 'Legacy', 'Infernal', 'Hellish Rebuke', 3, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.'),
    ('Fiendish Legacy', 'Legacy', 'Infernal', 'Darkness', 5, 'Long Rest', 'Always prepared; can be cast once without a spell slot per Long Rest.');

CREATE TEMP TABLE _import_trait_spell_data (
    trait_name TEXT NOT NULL,
    spell_name TEXT NOT NULL,
    PRIMARY KEY (trait_name, spell_name)
) ON COMMIT DROP;

INSERT INTO _import_trait_spell_data (
    trait_name,
    spell_name
) VALUES
    ('Light Bearer', 'Light'),
    ('Otherworldly Presence', 'Thaumaturgy');

CREATE TEMP TABLE _import_species_effect_data (
    trait_name TEXT NOT NULL,
    effect_name TEXT NOT NULL,
    description TEXT,
    effect_type TEXT NOT NULL,
    duration_text TEXT,
    requires_choice BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (trait_name, effect_name)
) ON COMMIT DROP;

INSERT INTO _import_species_effect_data (
    trait_name,
    effect_name,
    description,
    effect_type,
    duration_text,
    requires_choice
) VALUES
    ('Celestial Resistance', 'Celestial Resistance', 'Resistance to Necrotic and Radiant damage.', 'damage_adjustment', NULL, FALSE),
    ('Dwarven Resilience', 'Dwarven Resilience', 'Resistance to Poison damage and Advantage on saves to avoid or end the Poisoned condition.', 'damage_adjustment', NULL, FALSE),
    ('Fey Ancestry', 'Fey Ancestry', 'Advantage on saving throws made to avoid or end the Charmed condition.', 'condition_adjustment', NULL, FALSE),
    ('Brave', 'Brave', 'Advantage on saving throws made to avoid or end the Frightened condition.', 'condition_adjustment', NULL, FALSE),
    ('Darkvision (60 ft)', 'Darkvision (60 ft)', 'You can see in darkness within 60 feet.', 'modifier', NULL, FALSE),
    ('Darkvision (120 ft)', 'Darkvision (120 ft)', 'You can see in darkness within 120 feet.', 'modifier', NULL, FALSE),
    ('Dwarven Toughness', 'Dwarven Toughness', 'Your Hit Point maximum increases by 1 per character level.', 'modifier', NULL, FALSE),
    ('Gnomish Cunning', 'Gnomish Cunning', 'Advantage on Intelligence, Wisdom, and Charisma saving throws.', 'modifier', NULL, FALSE),
    ('Powerful Build', 'Powerful Build', 'Advantage on checks to end the Grappled condition; count as one size larger for carrying capacity.', 'modifier', NULL, FALSE),
    ('Keen Senses', 'Keen Senses', 'Gain proficiency in Insight, Perception, or Survival.', 'proficiency', NULL, TRUE),
    ('Skillful', 'Skillful', 'Gain proficiency in one skill of your choice.', 'proficiency', NULL, TRUE),
    ('Healing Hands', 'Healing Hands', 'Magic action to touch and roll Proficiency Bonus d4s for healing; once per Long Rest.', 'special', NULL, FALSE),
    ('Light Bearer', 'Light Bearer', 'You know the Light cantrip; Charisma is your spellcasting ability for it.', 'special', NULL, FALSE),
    ('Otherworldly Presence', 'Otherworldly Presence', 'You know Thaumaturgy using your Fiendish Legacy spellcasting ability.', 'special', NULL, FALSE),
    ('Breath Weapon', 'Breath Weapon', 'Replace an attack with a cone or line breath weapon; Dexterity save for 1d10 ancestry damage, scaling at levels 5, 11, and 17. Uses equal Proficiency Bonus per Long Rest.', 'special', NULL, FALSE),
    ('Draconic Damage Resistance', 'Draconic Damage Resistance', 'Resistance to the damage type chosen with Draconic Ancestry.', 'special', NULL, FALSE),
    ('Draconic Flight', 'Draconic Flight', 'Starting at level 5, Bonus Action once per Long Rest to gain Fly Speed equal to Speed for 10 minutes.', 'special', NULL, FALSE),
    ('Stonecunning', 'Stonecunning', 'Bonus Action Tremorsense 60 feet for 10 minutes while touching stone; uses equal Proficiency Bonus per Long Rest.', 'special', NULL, FALSE),
    ('Trance', 'Trance', 'You do not need to sleep and can finish a Long Rest in 4 hours of conscious meditation.', 'special', NULL, FALSE),
    ('Large Form', 'Large Form', 'Starting at level 5, become Large for 10 minutes once per Long Rest with Advantage on Strength checks and +10 Speed.', 'special', NULL, FALSE),
    ('Halfling Nimbleness', 'Halfling Nimbleness', 'Move through the space of larger creatures without stopping in their space.', 'special', NULL, FALSE),
    ('Luck', 'Luck', 'When you roll a 1 on a D20 Test, reroll and must use the new roll.', 'special', NULL, FALSE),
    ('Naturally Stealthy', 'Naturally Stealthy', 'Hide when obscured only by a creature at least one size larger than you.', 'special', NULL, FALSE),
    ('Resourceful', 'Resourceful', 'Gain Heroic Inspiration whenever you finish a Long Rest.', 'special', NULL, FALSE),
    ('Versatile', 'Versatile', 'Gain one Origin feat of your choice.', 'special', NULL, TRUE),
    ('Adrenaline Rush', 'Adrenaline Rush', 'Bonus Action Dash grants Temporary Hit Points equal to Proficiency Bonus; uses equal Proficiency Bonus per Short or Long Rest.', 'special', NULL, FALSE),
    ('Relentless Endurance', 'Relentless Endurance', 'Drop to 1 Hit Point instead of 0 once per Long Rest when not killed outright.', 'special', NULL, FALSE);

CREATE TEMP TABLE _import_species_option_effect_data (
    trait_name TEXT NOT NULL,
    option_group TEXT NOT NULL,
    option_name TEXT NOT NULL,
    effect_name TEXT NOT NULL,
    description TEXT,
    effect_type TEXT NOT NULL,
    duration_text TEXT,
    requires_choice BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (trait_name, option_group, option_name, effect_name)
) ON COMMIT DROP;

INSERT INTO _import_species_option_effect_data (
    trait_name,
    option_group,
    option_name,
    effect_name,
    description,
    effect_type,
    duration_text,
    requires_choice
) VALUES
    ('Celestial Revelation', 'Revelation', 'Heavenly Wings', 'Celestial Revelation: Heavenly Wings', 'During Celestial Revelation, gain a Fly Speed equal to your Speed.', 'modifier', '1 minute', FALSE),
    ('Celestial Revelation', 'Revelation', 'Inner Radiance', 'Celestial Revelation: Inner Radiance', 'During Celestial Revelation, shed light and deal Radiant damage equal to your Proficiency Bonus to creatures within 10 feet at the end of your turns.', 'special', '1 minute', FALSE),
    ('Celestial Revelation', 'Revelation', 'Necrotic Shroud', 'Celestial Revelation: Necrotic Shroud', 'During Celestial Revelation, creatures other than your allies within 10 feet can gain the Frightened condition until the end of your next turn.', 'special', '1 minute', FALSE),
    ('Elven Lineage', 'Lineage', 'Drow', 'Elven Lineage: Drow Darkvision', 'Darkvision increases to 120 feet.', 'modifier', NULL, FALSE),
    ('Elven Lineage', 'Lineage', 'Wood Elf', 'Elven Lineage: Wood Elf Speed', 'Speed increases to 35 feet.', 'modifier', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Black', 'Draconic Damage Resistance: Black', 'Resistance to Acid damage from Black dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Blue', 'Draconic Damage Resistance: Blue', 'Resistance to Lightning damage from Blue dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Brass', 'Draconic Damage Resistance: Brass', 'Resistance to Fire damage from Brass dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Bronze', 'Draconic Damage Resistance: Bronze', 'Resistance to Lightning damage from Bronze dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Copper', 'Draconic Damage Resistance: Copper', 'Resistance to Acid damage from Copper dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Gold', 'Draconic Damage Resistance: Gold', 'Resistance to Fire damage from Gold dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Green', 'Draconic Damage Resistance: Green', 'Resistance to Poison damage from Green dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Red', 'Draconic Damage Resistance: Red', 'Resistance to Fire damage from Red dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'Silver', 'Draconic Damage Resistance: Silver', 'Resistance to Cold damage from Silver dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Draconic Ancestry', 'Dragon Ancestor', 'White', 'Draconic Damage Resistance: White', 'Resistance to Cold damage from White dragon ancestry.', 'damage_adjustment', NULL, FALSE),
    ('Fiendish Legacy', 'Legacy', 'Abyssal', 'Fiendish Legacy Resistance: Abyssal', 'Resistance to Poison damage from Abyssal legacy.', 'damage_adjustment', NULL, FALSE),
    ('Fiendish Legacy', 'Legacy', 'Chthonic', 'Fiendish Legacy Resistance: Chthonic', 'Resistance to Necrotic damage from Chthonic legacy.', 'damage_adjustment', NULL, FALSE),
    ('Fiendish Legacy', 'Legacy', 'Infernal', 'Fiendish Legacy Resistance: Infernal', 'Resistance to Fire damage from Infernal legacy.', 'damage_adjustment', NULL, FALSE);

CREATE TEMP TABLE _import_species_damage_adjustment_data (
    effect_name TEXT NOT NULL,
    damage_type TEXT NOT NULL,
    adjustment_type TEXT NOT NULL,
    scope_text TEXT,
    PRIMARY KEY (effect_name, damage_type, adjustment_type)
) ON COMMIT DROP;

INSERT INTO _import_species_damage_adjustment_data (
    effect_name,
    damage_type,
    adjustment_type,
    scope_text
) VALUES
    ('Celestial Resistance', 'Necrotic', 'resistance', NULL),
    ('Celestial Resistance', 'Radiant', 'resistance', NULL),
    ('Dwarven Resilience', 'Poison', 'resistance', NULL),
    ('Draconic Damage Resistance: Black', 'Acid', 'resistance', NULL),
    ('Draconic Damage Resistance: Blue', 'Lightning', 'resistance', NULL),
    ('Draconic Damage Resistance: Brass', 'Fire', 'resistance', NULL),
    ('Draconic Damage Resistance: Bronze', 'Lightning', 'resistance', NULL),
    ('Draconic Damage Resistance: Copper', 'Acid', 'resistance', NULL),
    ('Draconic Damage Resistance: Gold', 'Fire', 'resistance', NULL),
    ('Draconic Damage Resistance: Green', 'Poison', 'resistance', NULL),
    ('Draconic Damage Resistance: Red', 'Fire', 'resistance', NULL),
    ('Draconic Damage Resistance: Silver', 'Cold', 'resistance', NULL),
    ('Draconic Damage Resistance: White', 'Cold', 'resistance', NULL),
    ('Fiendish Legacy Resistance: Abyssal', 'Poison', 'resistance', NULL),
    ('Fiendish Legacy Resistance: Chthonic', 'Necrotic', 'resistance', NULL),
    ('Fiendish Legacy Resistance: Infernal', 'Fire', 'resistance', NULL);

CREATE TEMP TABLE _import_species_condition_adjustment_data (
    effect_name TEXT NOT NULL,
    status_name TEXT NOT NULL,
    adjustment_type TEXT NOT NULL,
    scope_text TEXT,
    PRIMARY KEY (effect_name, status_name, adjustment_type)
) ON COMMIT DROP;

INSERT INTO _import_species_condition_adjustment_data (
    effect_name,
    status_name,
    adjustment_type,
    scope_text
) VALUES
    ('Dwarven Resilience', 'Poisoned', 'advantage', 'Saving throws made to avoid or end the Poisoned condition.'),
    ('Fey Ancestry', 'Charmed', 'advantage', 'Saving throws made to avoid or end the Charmed condition.'),
    ('Brave', 'Frightened', 'advantage', 'Saving throws made to avoid or end the Frightened condition.');

CREATE TEMP TABLE _import_species_effect_modifier_data (
    effect_name TEXT NOT NULL,
    affected_stat TEXT NOT NULL,
    operation TEXT NOT NULL,
    modifier_value INT,
    PRIMARY KEY (effect_name, affected_stat, operation)
) ON COMMIT DROP;

INSERT INTO _import_species_effect_modifier_data (
    effect_name,
    affected_stat,
    operation,
    modifier_value
) VALUES
    ('Darkvision (60 ft)', 'darkvision_range', 'set', 60),
    ('Darkvision (120 ft)', 'darkvision_range', 'set', 120),
    ('Dwarven Toughness', 'hp_max_per_level', 'add', 1),
    ('Gnomish Cunning', 'intelligence_saving_throw', 'advantage', NULL),
    ('Gnomish Cunning', 'wisdom_saving_throw', 'advantage', NULL),
    ('Gnomish Cunning', 'charisma_saving_throw', 'advantage', NULL),
    ('Powerful Build', 'grapple_escape_check', 'advantage', NULL),
    ('Celestial Revelation: Heavenly Wings', 'fly_speed', 'set', 0),
    ('Elven Lineage: Drow Darkvision', 'darkvision_range', 'set', 120),
    ('Elven Lineage: Wood Elf Speed', 'speed', 'set', 35);

CREATE TEMP TABLE _import_species_effect_proficiency_data (
    effect_name TEXT NOT NULL,
    proficiency_type TEXT NOT NULL,
    name TEXT,
    requires_choice BOOLEAN NOT NULL DEFAULT FALSE,
    choice_count INT NOT NULL DEFAULT 1,
    notes TEXT,
    PRIMARY KEY (effect_name, proficiency_type)
) ON COMMIT DROP;

INSERT INTO _import_species_effect_proficiency_data (
    effect_name,
    proficiency_type,
    name,
    requires_choice,
    choice_count,
    notes
) VALUES
    ('Keen Senses', 'skill', NULL, TRUE, 1, 'Choose Insight, Perception, or Survival.'),
    ('Skillful', 'skill', NULL, TRUE, 1, 'Choose one skill proficiency.');

INSERT INTO damage_types (name) VALUES
    ('Acid'),
    ('Cold'),
    ('Fire'),
    ('Lightning'),
    ('Necrotic'),
    ('Poison'),
    ('Radiant'),
    ('Thunder')
ON CONFLICT (name) DO NOTHING;

INSERT INTO statuses (
    name,
    description
) VALUES
    ('Charmed', 'Cannot harm the charmer, and the charmer has social advantage over the affected creature.'),
    ('Frightened', 'Fear limits movement and imposes disadvantage while the source is in sight.'),
    ('Poisoned', 'Disadvantage on attack rolls and ability checks.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

INSERT INTO species (
    name,
    description,
    creature_type,
    size_options,
    base_speed
)
SELECT
    name,
    description,
    creature_type,
    size_options,
    base_speed
FROM _import_species_data
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    creature_type = EXCLUDED.creature_type,
    size_options = EXCLUDED.size_options,
    base_speed = EXCLUDED.base_speed;

INSERT INTO traits (
    name,
    description
)
SELECT DISTINCT ON (trait_name)
    trait_name,
    description
FROM _import_species_trait_data
ORDER BY trait_name, description
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

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
FROM _import_trait_option_group_data og
JOIN traits t ON t.name = og.trait_name
ON CONFLICT (trait_id, option_group) DO UPDATE SET
    choice_count = EXCLUDED.choice_count,
    is_required = EXCLUDED.is_required,
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
FROM _import_trait_option_data ot
JOIN traits t ON t.name = ot.trait_name
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

WITH keen_senses_trait AS (
    SELECT id
    FROM traits
    WHERE name = 'Keen Senses'
),
skill_options AS (
    SELECT
        id AS skill_id,
        name,
        'Gain proficiency in the ' || name || ' skill.' AS description,
        CASE name
            WHEN 'Insight' THEN 10
            WHEN 'Perception' THEN 20
            WHEN 'Survival' THEN 30
        END AS sort_order
    FROM skills
    WHERE name IN ('Insight', 'Perception', 'Survival')
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
    keen_senses_trait.id,
    'Skill Proficiency',
    skill_options.skill_id,
    skill_options.name,
    skill_options.description,
    skill_options.sort_order
FROM keen_senses_trait
CROSS JOIN skill_options
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    tool_id = NULL,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

WITH skillful_trait AS (
    SELECT id
    FROM traits
    WHERE name = 'Skillful'
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
    skillful_trait.id,
    'Skill Proficiency',
    skill_options.skill_id,
    skill_options.name,
    skill_options.description,
    skill_options.sort_order
FROM skillful_trait
CROSS JOIN skill_options
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    tool_id = NULL,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO trait_spells (
    trait_id,
    spell_id
)
SELECT
    t.id,
    sp.id
FROM _import_trait_spell_data tsd
JOIN traits t ON t.name = tsd.trait_name
JOIN spells sp ON sp.name = tsd.spell_name
ON CONFLICT (trait_id, spell_id) DO NOTHING;

INSERT INTO trait_option_spells (
    trait_option_id,
    spell_id,
    level_required,
    always_prepared,
    free_casts_per,
    notes
)
SELECT
    tro.id,
    sp.id,
    osd.level_required,
    TRUE,
    osd.free_casts_per,
    osd.notes
FROM _import_trait_option_spell_data osd
JOIN traits t ON t.name = osd.trait_name
JOIN trait_options tro ON tro.trait_id = t.id
    AND tro.option_group = osd.option_group
    AND tro.name = osd.option_name
JOIN spells sp ON sp.name = osd.spell_name
ON CONFLICT (trait_option_id, spell_id, level_required) DO UPDATE SET
    always_prepared = EXCLUDED.always_prepared,
    free_casts_per = EXCLUDED.free_casts_per,
    notes = EXCLUDED.notes;

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
FROM _import_species_effect_data ed
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
FROM _import_species_effect_data ed
JOIN traits t ON t.name = ed.trait_name
WHERE e.trait_id = t.id
  AND e.name = ed.effect_name;

INSERT INTO effects (
    trait_option_id,
    name,
    description,
    effect_type,
    duration_text,
    requires_choice
)
SELECT
    tro.id,
    oed.effect_name,
    oed.description,
    oed.effect_type,
    oed.duration_text,
    oed.requires_choice
FROM _import_species_option_effect_data oed
JOIN traits t ON t.name = oed.trait_name
JOIN trait_options tro ON tro.trait_id = t.id
    AND tro.option_group = oed.option_group
    AND tro.name = oed.option_name
WHERE NOT EXISTS (
    SELECT 1
    FROM effects e
    WHERE e.trait_option_id = tro.id
      AND e.name = oed.effect_name
);

UPDATE effects e
SET
    description = oed.description,
    effect_type = oed.effect_type,
    duration_text = oed.duration_text,
    requires_choice = oed.requires_choice
FROM _import_species_option_effect_data oed
JOIN traits t ON t.name = oed.trait_name
JOIN trait_options tro ON tro.trait_id = t.id
    AND tro.option_group = oed.option_group
    AND tro.name = oed.option_name
WHERE e.trait_option_id = tro.id
  AND e.name = oed.effect_name;

CREATE TEMP TABLE _import_species_effects ON COMMIT DROP AS
SELECT
    e.id AS effect_id,
    ed.effect_name
FROM _import_species_effect_data ed
JOIN traits t ON t.name = ed.trait_name
JOIN effects e ON e.trait_id = t.id
    AND e.name = ed.effect_name

UNION ALL

SELECT
    e.id AS effect_id,
    oed.effect_name
FROM _import_species_option_effect_data oed
JOIN traits t ON t.name = oed.trait_name
JOIN trait_options tro ON tro.trait_id = t.id
    AND tro.option_group = oed.option_group
    AND tro.name = oed.option_name
JOIN effects e ON e.trait_option_id = tro.id
    AND e.name = oed.effect_name;

DELETE FROM effect_damage_adjustments eda
USING _import_species_effects ise,
      _import_species_damage_adjustment_data da
WHERE eda.effect_id = ise.effect_id
  AND ise.effect_name = da.effect_name;

INSERT INTO effect_damage_adjustments (
    effect_id,
    damage_type_id,
    adjustment_type,
    scope_text
)
SELECT
    ise.effect_id,
    dt.id,
    da.adjustment_type,
    da.scope_text
FROM _import_species_damage_adjustment_data da
JOIN _import_species_effects ise ON ise.effect_name = da.effect_name
JOIN damage_types dt ON dt.name = da.damage_type;

DELETE FROM effect_condition_adjustments eca
USING _import_species_effects ise,
      _import_species_condition_adjustment_data ca
WHERE eca.effect_id = ise.effect_id
  AND ise.effect_name = ca.effect_name;

INSERT INTO effect_condition_adjustments (
    effect_id,
    status_id,
    adjustment_type,
    scope_text
)
SELECT
    ise.effect_id,
    s.id,
    ca.adjustment_type,
    ca.scope_text
FROM _import_species_condition_adjustment_data ca
JOIN _import_species_effects ise ON ise.effect_name = ca.effect_name
JOIN statuses s ON s.name = ca.status_name;

INSERT INTO effect_modifiers (
    effect_id,
    affected_stat,
    operation,
    modifier_value
)
SELECT
    ise.effect_id,
    em.affected_stat,
    em.operation,
    em.modifier_value
FROM _import_species_effect_modifier_data em
JOIN _import_species_effects ise ON ise.effect_name = em.effect_name
ON CONFLICT (effect_id, affected_stat, operation) DO UPDATE SET
    modifier_value = EXCLUDED.modifier_value;

DELETE FROM effect_proficiencies ep
USING _import_species_effects ise
WHERE ep.effect_id = ise.effect_id;

INSERT INTO effect_proficiencies (
    effect_id,
    proficiency_type,
    name,
    requires_choice,
    choice_count,
    notes
)
SELECT
    ise.effect_id,
    ep.proficiency_type,
    ep.name,
    ep.requires_choice,
    ep.choice_count,
    ep.notes
FROM _import_species_effect_proficiency_data ep
JOIN _import_species_effects ise ON ise.effect_name = ep.effect_name;

INSERT INTO species_traits (
    species_id,
    trait_id
)
SELECT
    s.id,
    t.id
FROM _import_species_trait_data std
JOIN species s ON s.name = std.species_name
JOIN traits t ON t.name = std.trait_name
ON CONFLICT (species_id, trait_id) DO NOTHING;

COMMIT;
