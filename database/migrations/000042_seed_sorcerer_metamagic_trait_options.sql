-- Sorcerer Metamagic: trait_option_groups + trait_options para o builder persistir escolhas.

INSERT INTO trait_option_groups (trait_id, option_group, choice_count, is_required, notes)
SELECT t.id, 'metamagic', 2, TRUE, 'Escolha opções de Metamagic conhecidas.'
FROM traits t
WHERE t.name = 'Sorcerer: Metamagic'
ON CONFLICT (trait_id, option_group) DO UPDATE SET
    choice_count = EXCLUDED.choice_count,
    is_required = EXCLUDED.is_required,
    notes = EXCLUDED.notes;

INSERT INTO trait_options (trait_id, option_group, name, description, sort_order)
SELECT
    parent.id,
    'metamagic',
    meta.name,
    meta.description,
    ROW_NUMBER() OVER (ORDER BY meta.name) * 10
FROM traits meta
JOIN traits parent ON parent.name = 'Sorcerer: Metamagic'
WHERE meta.name LIKE 'Metamagic:%'
ON CONFLICT (trait_id, option_group, name) DO UPDATE SET
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;
