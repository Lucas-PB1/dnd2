# Schema SQL — mapa da ficha do jogador

**81 tabelas**, **18 views**. Aplicar migrations `000001`–`000034` — ordem em `../README.md`.

## Ficha em jogo — contrato recomendado

**1 round-trip:** `get_character_sheet(character_id)` → JSONB com `summary`, `inventory`, `traits`, `active_effects`, `stat_modifiers`, `trait_options`, `trait_spell_choices`.

Após equipar/consumir, re-fetch só `active_effects` + `inventory` (views ou RPC parcial futuro).

### Sessão — RPCs (orquestração manual)

A app rola d20 e decide o resultado; o banco mantém estado e devolve contexto.

| RPC | Papel |
| --- | --- |
| `get_character_roll_context` | CD, ataque, perícias, armas, modifiers, slots, cargas |
| `adjust_character_hp` | Dano, cura, HP temporário |
| `spend_spell_slot` / `restore_spell_slots` | Slots de magia |
| `sync_character_spell_slots` | Inicializa slots da classe conjuradora principal |
| `sync_character_resources` | Sincroniza cargas/Rage/Ki das traits ativas |
| `spend_character_resource` | Gasta uso por `trait_id` + `resource_key` |
| `spend_trait_spell_charge` | Gasta carga ao conjurar magia de item (`charge_cost`) |
| `take_short_rest` / `take_long_rest` | Recupera slots e recursos |
| `set_character_condition` | Marca/remove condição na ficha |

| `create_character` | Cria PC: classes, proficiências, escolhas, inventário |
| `level_up_character` | Sobe nível / multiclasse; sync slots e cargas |

**Long rest:** encerra todos `character_effects` com duração; mantém só passivos (`duration_text` NULL).

## Views — auditoria

### Tier 1 — Ficha em jogo (consultar estas)

| View | Pergunta que responde |
| --- | --- |
| `v_character_summary` | Quem é o PC? HP, CA base, classes, condições |
| `v_character_inventory` | O que tenho equipado/portado? Attunement? Consumível? |
| `v_character_traits` | Quais traits estão ativas agora? |
| `v_character_trait_options` | Quais escolhas já fiz? (resistência, skill, Enspelled…) |
| `v_character_trait_spell_choices` | Quais magias escolhi em traits com spell choice? |
| `v_character_active_effects` | **Hub principal** — modifiers, dano, resistências, status (JSON) |
| `v_character_stat_modifiers` | Modifiers achatados (AC, saves, ataque) — sem parse JSON |
| `v_character_proficiency_details` | Perícias/idiomas/ferramentas (tabela + efeitos) |

**Regra:** para resistências, status e dano, use `v_character_active_effects` — não views separadas.

### Tier 2 — Criação / level-up (catálogo + progressão)

| View | Quando |
| --- | --- |
| `v_class_proficiency_details` | Montar proficiências iniciais de classe |
| `v_class_spell_slots` | Tabela de slots por nível |
| `v_background_equipment_details` | Equipamento A/B de background |
| `v_background_details` | Detalhe de background na criação |
| `v_trait_resource_details` | Recursos de classe por nível (Rage, Ki…) |
| `v_spell_knowledge_details` | Cantrips/preparadas por nível |
| `v_spell_list_details` | Listas de magias (Enspelled, Ritual Caster…) — inclui `spell_rolls` em JSON |

Não entram na ficha durante a sessão — só na construção do personagem. Cachear na app entre migrations.

### Tier 3 — Internas (não expor na app)

| View | Usada por |
| --- | --- |
| `v_effect_details` | `v_character_active_effects` (agrega JSON) |
| `v_weapon_details` | `v_character_inventory` |
| `v_character_trait_option_modifiers` | `v_character_stat_modifiers` (ASI de feat) |

### Removidas (redundantes)

| View removida | Migration | Motivo |
| --- | --- | --- |
| `v_character_damage_adjustments` | `012` | Duplicava `damage_adjustments` JSON em `v_character_active_effects` |
| `v_character_condition_adjustments` | `012` | Duplicava `condition_adjustments` JSON |
| `v_spell_roll_details` | `013` | Subset de `spell_rolls` já em `v_spell_list_details` |

## Grafo de dependência (ficha)

```text
v_character_traits ──────────────┐
v_character_trait_options ───────┼──► v_character_active_effects
character_effects ───────────────┘         │
                                           ├── modifiers (JSON)
v_character_trait_option_modifiers ──► v_character_stat_modifiers
                                           ├── damage_adjustments (JSON)
                                           ├── statuses (JSON)
                                           └── proficiencies → v_character_proficiency_details

v_weapon_details ──► v_character_inventory
v_effect_details ──► v_character_active_effects
```

## Fluxo: equipar → efeito

```text
inventory (is_equipped, is_attuned)
  └──► v_character_traits
         └──► v_character_active_effects
                ├── v_character_stat_modifiers  (se precisa de linhas flat)
                └── JSON: damage_adjustments, statuses, damage
```

## Fluxo: consumir poção

```text
consume_inventory_item() → character_effects → v_character_active_effects
```

## Tabelas por papel

### Catálogo

| Grupo | Tabelas |
| --- | --- |
| Identidade | `species`, `classes`, `subclasses`, `backgrounds`, `feats` |
| Traits | `traits`, `*_traits` |
| Efeitos | `effects` + `effect_*` |
| Magia | `spells`, `trait_spells` (`charge_cost`) |
| Recursos | `trait_resources`, `trait_resource_progressions` |
| Itens | `items`, `item_traits` |

### Personagem (sessão)

| Tabela | Papel |
| --- | --- |
| `inventory` | Equipar, sintonizar, quantidade |
| `character_effects` | Buffs temporários |
| `character_trait_options` | Escolhas persistidas |
| `character_resources` | Usos gastos |
| `character_spell_slots` | Slots usados |

## Queries de exemplo

`queries/ficha_do_jogador.sql` — RPC `get_character_sheet` + queries avulsas para debug.

## Aplicar no Supabase

1. `schema.sql` — schema + views + RPCs + RLS
2. `catalog_1.sql` → `catalog_2.sql` → `catalog_3.sql` — catálogo SRD (fonte: `imports/`)
3. Opcional: `tests/validation/integrity.sql`

Ordem completa: `README.md`.
