# D&D 2024 — Banco de dados

PostgreSQL/Supabase: catálogo SRD + ficha de personagem. Espelho do repositório `../sql/`, organizado em migrations.

## Estrutura

```text
database/
├── README.md
├── docs/
│   └── schema.md          # Mapa de tabelas, views, RPCs e contrato com a app
├── imports/               # Seeds por domínio (fonte de verdade dos dados)
└── migrations/            # Schema + seeds, ordem numérica
    ├── 000001 … 000012     # DDL: tabelas, views, auth, RPCs, RLS, grants
    └── 000013 … 000034     # Seeds (cópia ordenada de imports/)
```

## Aplicar no Supabase

### Opção A — Supabase CLI (recomendado)

```bash
# Na raiz do projeto (supabase/migrations → database/migrations)
supabase db push
```

Ou contra projeto remoto:

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

### Opção B — SQL Editor (banco vazio)

Rode **todas** as migrations em ordem (`000001` → `000034`) no SQL Editor do Dashboard.

Para reset completo em dev, concatene só o schema:

```bash
cat database/migrations/00000{1..9}_*.sql database/migrations/0000{10..12}_*.sql > /tmp/schema.sql
```

Depois rode os seeds `000013`–`000034`.

## Ordem dos seeds (imports/)

| Migration | Arquivo original | Conteúdo |
| --- | --- | --- |
| 000013 | `000_dnd_2024_damage_statuses.sql` | Tipos de dano, status |
| 000014 | `000_dnd_2024_skills_tools.sql` | Perícias e ferramentas |
| 000015 | `000_dnd_2024_spells.sql` | Magias |
| 000016 | `001_dnd_2024_armors.sql` | Armaduras |
| 000017 | `002_dnd_2024_weapons.sql` | Armas |
| 000018 | `003_dnd_2024_species.sql` | Espécies |
| 000019 | `004_dnd_2024_feats.sql` | Feats |
| 000020 | `005_dnd_2024_backgrounds.sql` | Backgrounds |
| 000021 | `006_dnd_2024_languages_roles_dice.sql` | Idiomas, roles, dados |
| 000022 | `007_dnd_2024_classes.sql` | Classes |
| 000023 | `008_dnd_2024_class_traits.sql` | Traits de classe |
| 000024 | `009_dnd_2024_feats_remaining.sql` | Feats restantes |
| 000025 | `010_dnd_2024_items_non_magic.sql` | Itens não mágicos |
| 000026 | `011_dnd_2024_items_magical.sql` | Itens mágicos |
| 000027 | `012_dnd_2024_optional_features.sql` | Optional features |
| 000028 | `013_dnd_2024_class_progression.sql` | Progressão de classe |
| 000029 | `014_dnd_2024_item_traits.sql` | Traits de item |
| 000030 | `015_dnd_2024_class_proficiencies.sql` | Proficiências |
| 000031 | `016_dnd_2024_background_equipment.sql` | Equipamento de background |
| 000032 | `017_dnd_2024_class_resources.sql` | Recursos de classe |
| 000033 | `018_dnd_2024_spell_knowledge.sql` | Spell knowledge |
| 000034 | `019_dnd_2024_class_trait_effects.sql` | Efeitos de traits |

## Contrato com a app

| Ação | RPC / view |
| --- | --- |
| Abrir ficha | `get_character_sheet` |
| Criar PC | `create_character` |
| Subir nível | `level_up_character` |
| Rolagem | `get_character_roll_context` |
| Sessão | `adjust_character_hp`, `spend_spell_slot`, `take_*_rest`… |
| Campanhas | CRUD direto em `campaigns` / `player_campaigns` (RLS) |

Detalhes: `docs/schema.md`.

## Manutenção

- Edite seeds em `imports/` e regenere a migration correspondente, ou copie de volta para `../sql/imports/` se o catálogo continuar sendo gerado lá.
- Geradores Python (`tools/`) permanecem no repo `../sql/` — não foram trazidos para cá.
