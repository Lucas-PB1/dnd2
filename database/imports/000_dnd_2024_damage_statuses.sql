BEGIN;

-- D&D 2024 / SRD 5.2.1 damage type and condition catalog.
-- Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
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
    ('Blinded', 'Cannot see; attacks and sight-based checks are impaired.'),
    ('Charmed', 'Cannot harm the charmer, and the charmer has social advantage over the affected creature.'),
    ('Deafened', 'Cannot hear and automatically fails checks that require hearing.'),
    ('Exhaustion', 'Represents cumulative physical or mental depletion.'),
    ('Frightened', 'Fear limits movement and imposes disadvantage while the source is in sight.'),
    ('Grappled', 'Speed becomes 0 and movement is restricted by the grappler.'),
    ('Incapacitated', 'Cannot take actions, Bonus Actions, or Reactions.'),
    ('Invisible', 'Cannot be seen without special senses or magic, and gains benefits against creatures that cannot see it.'),
    ('Paralyzed', 'Incapacitated and unable to move or speak; attacks against the creature are especially dangerous.'),
    ('Petrified', 'Transformed with limited awareness and severe restrictions.'),
    ('Poisoned', 'Disadvantage on attack rolls and ability checks.'),
    ('Prone', 'Lying down; movement and attacks are affected.'),
    ('Restrained', 'Speed becomes 0, attacks and Dexterity saves are impaired.'),
    ('Stunned', 'Incapacitated, unable to move, and can speak only falteringly.'),
    ('Unconscious', 'Incapacitated, unaware, unable to move or speak, and falls Prone.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

COMMIT;
