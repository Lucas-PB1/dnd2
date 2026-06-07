-- Migration: 000014 — seed 000_dnd_2024_skills_tools
BEGIN;

-- D&D 2024 / SRD 5.2.1 skill and tool catalog.
-- Sources:
-- - Skills table: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
-- - Tools section: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
INSERT INTO skills (
    name,
    base_attribute
) VALUES
    ('Acrobatics', 'DEX'),
    ('Animal Handling', 'WIS'),
    ('Arcana', 'INT'),
    ('Athletics', 'STR'),
    ('Deception', 'CHA'),
    ('History', 'INT'),
    ('Insight', 'WIS'),
    ('Intimidation', 'CHA'),
    ('Investigation', 'INT'),
    ('Medicine', 'WIS'),
    ('Nature', 'INT'),
    ('Perception', 'WIS'),
    ('Performance', 'CHA'),
    ('Persuasion', 'CHA'),
    ('Religion', 'INT'),
    ('Sleight of Hand', 'DEX'),
    ('Stealth', 'DEX'),
    ('Survival', 'WIS')
ON CONFLICT (name) DO UPDATE SET
    base_attribute = EXCLUDED.base_attribute;

WITH tool_data (
    name,
    category,
    base_attribute,
    description,
    cost_gp,
    weight_lb,
    utilize_text,
    craft_text
) AS (
    VALUES
        ('Alchemist''s Supplies', 'Artisan', 'INT', 'Tools for alchemy and substance work.', 50.00, 8.00, 'Identify a substance (DC 15), or start a fire (DC 15).', 'Acid, Alchemist''s Fire, Component Pouch, Oil, Paper, Perfume.'),
        ('Brewer''s Supplies', 'Artisan', 'INT', 'Tools for brewing and identifying drinks.', 20.00, 9.00, 'Detect poisoned drink (DC 15), or identify alcohol (DC 10).', 'Antitoxin.'),
        ('Calligrapher''s Supplies', 'Artisan', 'DEX', 'Tools for decorative writing and careful script.', 10.00, 5.00, 'Write text with impressive flourishes that guard against forgery (DC 15).', 'Ink, Spell Scroll.'),
        ('Carpenter''s Tools', 'Artisan', 'STR', 'Tools for shaping and assembling wood structures.', 8.00, 6.00, 'Seal or pry open a door or container (DC 20).', 'Club, Greatclub, Quarterstaff, Barrel, Chest, Ladder, Pole, Portable Ram, Torch.'),
        ('Cartographer''s Tools', 'Artisan', 'WIS', 'Tools for drafting and reading maps.', 15.00, 6.00, 'Draft a map of a small area (DC 15).', 'Map.'),
        ('Cobbler''s Tools', 'Artisan', 'DEX', 'Tools for footwear repair and modification.', 5.00, 5.00, 'Modify footwear to give Advantage on the wearer''s next Dexterity (Acrobatics) check (DC 10).', 'Climber''s Kit.'),
        ('Cook''s Utensils', 'Artisan', 'WIS', 'Tools for preparing and evaluating food.', 1.00, 8.00, 'Improve food''s flavor (DC 10), or detect spoiled or poisoned food (DC 15).', 'Rations.'),
        ('Glassblower''s Tools', 'Artisan', 'INT', 'Tools for shaping and evaluating glass.', 30.00, 5.00, 'Discern what a glass object held in the past 24 hours (DC 15).', 'Glass Bottle, Magnifying Glass, Spyglass, Vial.'),
        ('Jeweler''s Tools', 'Artisan', 'INT', 'Tools for evaluating and working gems and jewelry.', 25.00, 2.00, 'Discern a gem''s value (DC 15).', 'Arcane Focus, Holy Symbol.'),
        ('Leatherworker''s Tools', 'Artisan', 'DEX', 'Tools for working leather.', 5.00, 5.00, 'Add a design to a leather item (DC 10).', 'Sling, Whip, Hide Armor, Leather Armor, Studded Leather Armor, Backpack, Crossbow Bolt Case, Map or Scroll Case, Parchment, Pouch, Quiver, Waterskin.'),
        ('Mason''s Tools', 'Artisan', 'STR', 'Tools for shaping and marking stone.', 10.00, 8.00, 'Chisel a symbol or hole in stone (DC 10).', 'Block and Tackle.'),
        ('Painter''s Supplies', 'Artisan', 'WIS', 'Tools for painting recognizable images.', 10.00, 5.00, 'Paint a recognizable image of something you have seen (DC 10).', 'Druidic Focus, Holy Symbol.'),
        ('Potter''s Tools', 'Artisan', 'INT', 'Tools for shaping and evaluating ceramics.', 10.00, 3.00, 'Discern what a ceramic object held in the past 24 hours (DC 15).', 'Jug, Lamp.'),
        ('Smith''s Tools', 'Artisan', 'STR', 'Tools for metalworking.', 20.00, 8.00, 'Pry open a door or container (DC 20).', 'Any Melee weapon except Club, Greatclub, Quarterstaff, and Whip; Medium armor except Hide; Heavy armor; Ball Bearings; Bucket; Caltrops; Chain; Crowbar; Firearm Bullets; Grappling Hook; Iron Pot; Iron Spikes; Sling Bullets.'),
        ('Tinker''s Tools', 'Artisan', 'DEX', 'Tools for assembling small mechanical objects.', 50.00, 10.00, 'Assemble a Tiny item composed of scrap, which falls apart in 1 minute (DC 20).', 'Musket, Pistol, Bell, Bullseye Lantern, Flask, Hooded Lantern, Hunting Trap, Lock, Manacles, Mirror, Shovel, Signal Whistle, Tinderbox.'),
        ('Weaver''s Tools', 'Artisan', 'DEX', 'Tools for clothwork and weaving.', 1.00, 5.00, 'Mend a tear in clothing (DC 10), or sew a Tiny design (DC 10).', 'Padded Armor, Basket, Bedroll, Blanket, Fine Clothes, Net, Robe, Rope, Sack, String, Tent, Traveler''s Clothes.'),
        ('Woodcarver''s Tools', 'Artisan', 'DEX', 'Tools for carving and shaping wood.', 1.00, 5.00, 'Carve a pattern in wood (DC 10).', 'Club, Greatclub, Quarterstaff, Ranged weapons except Pistol, Musket, and Sling; Arcane Focus; Arrows; Bolts; Druidic Focus; Ink Pen; Needles.'),
        ('Dice Set', 'Gaming Set', 'WIS', 'A gaming set variant.', 0.10, NULL, 'Discern whether someone is cheating (DC 10), or win the game (DC 20).', NULL),
        ('Dragonchess Set', 'Gaming Set', 'WIS', 'A gaming set variant.', 1.00, NULL, 'Discern whether someone is cheating (DC 10), or win the game (DC 20).', NULL),
        ('Playing Card Set', 'Gaming Set', 'WIS', 'A gaming set variant.', 0.50, NULL, 'Discern whether someone is cheating (DC 10), or win the game (DC 20).', NULL),
        ('Three-Dragon Ante Set', 'Gaming Set', 'WIS', 'A gaming set variant.', 1.00, NULL, 'Discern whether someone is cheating (DC 10), or win the game (DC 20).', NULL),
        ('Bagpipes', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 30.00, 6.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Drum', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 6.00, 3.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Dulcimer', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 25.00, 10.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Flute', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 2.00, 1.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Horn', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 3.00, 2.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Lute', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 35.00, 2.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Lyre', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 30.00, 2.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Pan Flute', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 12.00, 2.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Shawm', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 2.00, 1.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Viol', 'Musical Instrument', 'CHA', 'A musical instrument variant.', 30.00, 1.00, 'Play a known tune (DC 10), or improvise a song (DC 15).', NULL),
        ('Disguise Kit', 'Other', 'CHA', 'A kit for applying disguise and costume work.', 25.00, 3.00, 'Apply makeup (DC 10).', 'Costume.'),
        ('Forgery Kit', 'Other', 'DEX', 'A kit for imitating handwriting and seals.', 15.00, 5.00, 'Mimic 10 or fewer words of someone else''s handwriting (DC 15), or duplicate a wax seal (DC 20).', NULL),
        ('Herbalism Kit', 'Other', 'INT', 'A kit for identifying plants and making remedies.', 5.00, 3.00, 'Identify a plant (DC 10).', 'Antitoxin, Candle, Healer''s Kit, Potion of Healing.'),
        ('Navigator''s Tools', 'Other', 'WIS', 'Tools for navigation by maps, courses, and stars.', 25.00, 2.00, 'Plot a course (DC 10), or determine position by stargazing (DC 15).', NULL),
        ('Poisoner''s Kit', 'Other', 'INT', 'A kit for detecting and making poisons.', 50.00, 2.00, 'Detect a poisoned object (DC 10).', 'Basic Poison.'),
        ('Thieves'' Tools', 'Other', 'DEX', 'Tools for opening locks and disarming traps.', 25.00, 1.00, 'Pick a lock (DC 15), or disarm a trap (DC 15).', NULL)
)
INSERT INTO tools (
    name,
    category,
    base_attribute,
    description,
    cost_gp,
    weight_lb,
    utilize_text,
    craft_text
)
SELECT
    name,
    category,
    base_attribute,
    description,
    cost_gp,
    weight_lb,
    utilize_text,
    craft_text
FROM tool_data
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    base_attribute = EXCLUDED.base_attribute,
    description = EXCLUDED.description,
    cost_gp = EXCLUDED.cost_gp,
    weight_lb = EXCLUDED.weight_lb,
    utilize_text = EXCLUDED.utilize_text,
    craft_text = EXCLUDED.craft_text;

COMMIT;
