# Criação de personagem em qualquer nível (1–20)

Documento de design para estender o **Character Builder** além do nível 1. Cobre conjuradores, não conjuradores, subclasse, ASI/feats, magias, recursos e integração com o backend existente.

---

## Checklist completo

**Legenda:** ✅ concluído · ⬜ pendente

Marque conforme for implementando. Itens já feitos no builder **nível 1** estão marcados.

### Baseline (já existe — nível 1)

- ✅ Wizard 6 passos: Atributos → Espécie → Antecedente → Classe → Escolhas → Detalhes
- ✅ RPC `create_character` com classes, skills, feats, spells, trait_options, inventário
- ✅ `sync_character_spell_slots` + `sync_character_resources` pós-criação
- ✅ Perícias de classe (escolha nível 1)
- ✅ Ferramentas de classe / background
- ✅ Truques + preparadas + grimório Lv1 (casters)
- ✅ Expertise nível 1 (ex.: Ladino)
- ✅ Feats de origem (background + Humano Versátil)
- ✅ Magias de feat de origem
- ✅ Equipamento A/B do antecedente
- ✅ Traços de espécie com escolha obrigatória
- ✅ ASI de antecedente (+2/+1 ou +1 em todos)
- ✅ Catálogo Tier 2 (`spell_knowledge_by_level`, slots, recursos)

### Infraestrutura — Fase 1

- ✅ `class_level: number` (1–20) em `CharacterBuilderState` (default 1)
- ✅ Seletor de nível no passo Classe (UI)
- ✅ Atualizar subtítulo do passo Classe (remover “Nível 1” fixo)
- ✅ `BUILDER_STEPS` — subtitle da etapa classe reflete nível variável
- ✅ Query `class_level` em `GET /api/characters/builder-data`
- ✅ `BuilderDetailsRequest.class_level` em `server/types.ts`
- ✅ Remover `BUILDER_CLASS_LEVEL = 1` fixo; passar nível como parâmetro
- ✅ `fetch-class-spellcasting.ts` — contagens por `class_level`
- ✅ `fetch-class-expertise.ts` — `level_required <= class_level`
- ✅ Chave de detalhes: `class_id:species_id:background_id:class_level`
- ✅ Recarregar details ao mudar `class_level`
- ✅ Reset de escolhas dependentes ao mudar nível/classe
- ✅ `fetchCharacterBuilderDetails` / `builder.service.ts` — param `class_level`
- ✅ `toCreateCharacterRpcBody` — `class_level` dinâmico (não hardcode 1)
- ✅ `lib/character/map-row.ts` — `class_level` e `subclass_id` parametrizados no RPC legacy
- ✅ `computeMaxHp(hitDie, conMod, level, mode)` (substituir `computeLevel1Hp`)
- ✅ Payload `max_hp` / `current_hp` por nível total
- ✅ Preview lateral: nível, PV, bônus de proficiência
- ✅ Preview lateral: contagem de slots (read-only, opcional Fase 1)
- ✅ `BUILDER_SPELL_LEVEL` — parametrizar por nível alvo (via fetches)
- ✅ Facts nos cards de classe atualizados por nível (magias, expertise, feats)
- ✅ Testes unitários: HP nível 1, 5, 20
- ✅ Testes unitários: payload RPC com `class_level` correto
- ✅ Testes unitários: spell counts @ nível 5 (full caster)

### State e domínio — novos tipos (parcial Fase 1)

- ✅ `domain/progression/levels.ts` — `FEAT_CHOICE_LEVELS`, `SUBCLASS_UNLOCK`, prof bonus
- ✅ `domain/progression/hp.ts`
- ✅ `domain/progression/spell-progression.ts` — grimório Wizard (fórmula PHB)
- ✅ `domain/state/state.ts` — `class_level` no initial state
- ✅ `domain/state/validation.ts` — validação nível 1–20
- ✅ `domain/payload.ts` — `class_level`, HP por nível

### Banco de dados — migrations / seeds

- ✅ Tabela ou fórmula documentada: grimório Wizard por nível (`spellbook_spells_by_level` ou equivalente)
- ✅ Seed grimório: L1 = 6 magias; +2 por nível de classe (PHB 2024) — fórmula em `spell-progression.ts`
- ⬜ Constantes ou tabela: ouro inicial por nível (DMG) — Fase 3+
- ✅ View ou parser: elegibilidade de feat por prerequisito — parser básico em `feats.ts`
- ⬜ Coluna opcional `subclasses.unlock_level` (default 3) — ou constante global
- ✅ Confirmar `create_character` persiste `subclass_id` em `character_classes` (já suportado)

### Subclasse — Fase 2

- ✅ UI seleção de subclasse no passo Classe (se `class_level >= 3`)
- ✅ Validação: subclasse obrigatória quando `class_level >= 3`
- ✅ Payload `classes[].subclass_id`
- ✅ Reset `subclass_id` se nível cair abaixo de 3
- ✅ Modal/detalhe de subclasse (já existe leitura; ligar à seleção)
- ✅ Escolhas de subclasse nível 3 (trait_options) — Battle Master Maneuvers, etc. (via aba Classe)

### Expertise multi-nível — Fase 2

- ✅ Rogue: Expertise @ 1 e @ 6 (fetch `level_required <= class_level`)
- ✅ Bard: Expertise @ 2 e @ 9
- ✅ Ranger: Expertise @ 2 (Deft Explorer)
- ⬜ Expertise via feats de progressão (Observant, Keen Mind, etc.)
- ✅ UI: grupos separados por trait/nível
- ✅ Validação: cada grupo com `choice_count` correto
- ✅ Payload skills com `has_expertise` por perícia acumulada

### Magias — Fase 2 (por arquétipo)

#### Infra magias

- ✅ `max_spell_level` no fetch (`fetch-class-spellcasting.ts`)
- ⬜ `SpellProgressionSnapshot` — cantrips / preparadas / grimório @ nível N
- ⬜ `SpellSelectionBucket` — escolhas por nível desbloqueado
- ✅ Validação: truques totais === `spell_knowledge` @ N
- ✅ Validação: preparadas totais === `spell_knowledge` @ N
- ✅ Validação: cada magia ≤ slot máximo disponível no nível
- ✅ Validação Wizard: preparadas ⊆ grimório
- ⬜ `buildSpellsRpcPayload` — magias acumuladas de todos os níveis
- ✅ UI Magias: seções truques / grimório / preparadas com pool por slot max
- ✅ Remover pool fixo só Lv1 (`leveledSpellsForClass` + `max_spell_level`)

#### Wizard (full + grimório)

- ✅ Contagem grimório total @ nível N
- ✅ Escolha de magias grimório (níveis 1–slot max)
- ✅ Escolha preparadas ⊆ grimório
- ✅ Truques @ nível N

#### Cleric (full, preparadas)

- ✅ Truques @ nível N
- ✅ Preparadas @ nível N (lista completa da classe)

#### Druid (full, preparadas)

- ✅ Truques @ nível N
- ✅ Preparadas @ nível N

#### Bard (full + Magical Secrets)

- ✅ Truques @ nível N
- ✅ Preparadas @ nível N
- ✅ Magical Secrets @ 10 — pool Bard/Cleric/Druid/Wizard em preparadas

#### Sorcerer (full)

- ✅ Truques @ nível N
- ✅ Preparadas @ nível N

#### Warlock (pact)

- ✅ Truques @ nível N
- ✅ Preparadas @ nível N
- ⬜ Slots pact (automático via sync — verificar ficha)

#### Paladin (half)

- ✅ Sem truques
- ✅ Preparadas @ nível N (`paladin-prepared`)
- ⬜ Slots half (automático via sync)

#### Ranger (half)

- ✅ Sem truques
- ✅ Preparadas @ nível N (`ranger-prepared`)
- ⬜ Slots half (automático via sync)

### Traços opcionais de classe — Fase 3

- ✅ `fetch-optional-features.ts` (server)
- ✅ `domain/optional-features/` (domain)
- ✅ Cleric: Divine Order @ 1 (via trait_option_groups)
- ✅ Druid: Primal Order @ 1
- ✅ Fighter: Fighting Style @ 1
- ✅ Fighter Battle Master: Maneuvers @ 3 (contagem por nível)
- ✅ Sorcerer: Metamagic @ 2 (+ escolhas extras por nível) — migration `000042` + contagem 2/4/6
- ✅ Warlock: Pact Boon @ 2 (Blade / Chain / Tome) via Invocations
- ✅ Warlock: Eldritch Invocations @ 2+ (`warlock-invocations`)
- ✅ UI aba Classe (Manobras / Invocações / Fighting Style…)
- ✅ Validação `choice_count` por grupo e nível
- ✅ Payload `trait_options` com escolhas de classe

### Feats de progressão — Fase 3

- ✅ Slots derivados: níveis 4, 8, 12, 16, 19
- ✅ UI: uma escolha por slot (ASI **ou** General Feat **ou** Epic Boon @ 19)
- ✅ ASI: escolhas via trait_options do feat Ability Score Improvement
- ✅ ASI: preview lateral via `computePreviewAbilities` + `domain/progression/asi.ts`
- ✅ General Feat: filtrar por prerequisito de nível/atributo (parser básico)
- ✅ Epic Boon @ 19: filtrar categoria Epic Boon (+ General)
- ✅ Feat com trait_options internas (payload)
- ✅ Feat com magias (trait_spell_choices) — feats de progressão (Magic Initiate etc.)
- ✅ `fetch-progression-feats.ts` — catálogo General + Epic Boon
- ✅ Payload `feats[]` com `selection_key: "level_4"` etc.
- ✅ Validação: todos os slots preenchidos antes de criar

### Equipamento e ouro — Fase 3

- ✅ Nível 1: pacote A/B background (mantém atual)
- ✅ Nível 2+: simplificação documentada na UI (pacote background; ouro DMG = v2)
- ⬜ UI toggle equipamento vs ouro (v2)
- ⬜ Payload inventário ou campo `starting_gold` (se migration, v2)

### UI — componentes

- ✅ `StepClass.tsx` — seletor nível + subclasse
- ✅ `StepChoices.tsx` — tabs dinâmicas via `useChoiceTabs`
- ✅ `ChoicesSpellsTab.tsx` — multi-nível + Magical Secrets
- ✅ `ChoicesFeatsTab.tsx` — origem + progressão 4/8/12/16/19
- ✅ Escolhas de subclasse — via passo Classe + aba Classe (optional features)
- ✅ Invocações / Metamagic — aba Classe (`ChoicesOptionalTab`)
- ✅ `useChoiceTabs.ts` — badges por escolhas
- ✅ `BuilderPreviewPanel.tsx` — nível, PV, prof
- ⬜ `StepDetails.tsx` — resumo com nível e subclasse
- ✅ `CharacterBuilderWizard.tsx` — details key + reset por nível
- ⬜ `builder-detail-content.tsx` — features até nível selecionado (opcional)

### Não conjuradores — escolhas por classe

- ⬜ **Barbarian** — subclasse @ 3; Rage/recursos via sync (sem UI extra)
- ⬜ **Fighter** — Fighting Style @ 1; subclasse @ 3; Maneuvers se BM
- ⬜ **Monk** — subclasse @ 3; Focus via sync
- ⬜ **Rogue** — subclasse @ 3; Expertise @ 1 e @ 6; feats 4/8/12/16/19

### Automático pós-criação (verificar, sem UI)

- ⬜ Slots de magia corretos @ nível N (`v_class_spell_slots`)
- ⬜ Rage / Second Wind / Channel Divinity / Ki — `sync_character_resources`
- ⬜ Bônus de proficiência @ nível total
- ⬜ Traits passivas de classe até nível N na ficha
- ⬜ Traits passivas de subclasse até nível N na ficha

### Testes

- ✅ Unit: `computeMaxHp` (max por nível)
- ⬜ Unit: `computeMaxHp` (average)
- ⬜ Unit: `featChoicesRequired(1..20)`
- ✅ Unit: Wizard spellbook total @ 1, 5, 10, 20 (parcial: @5 em `class-spells.test.ts`)
- ⬜ Unit: validação magias acumuladas
- ⬜ Unit: payload completo nível 5 Fighter
- ⬜ Unit: payload completo nível 10 Wizard
- ⬜ E2E: Barbarian 3 (subclasse)
- ⬜ E2E: Rogue 6 (expertise dupla)
- ⬜ E2E: Warlock 7 (invocações)
- ⬜ E2E: Fighter 5 Battle Master (manobras)
- ⬜ E2E: Paladin 5 (half caster)

### Fase 4 — fora do escopo inicial

- ⬜ Multiclasse (múltiplas entradas em `classes[]`)
- ⬜ UI level-up na ficha (`level_up_character`)
- ⬜ Import/export de build JSON
- ⬜ Loja de equipamento com ouro inicial
- ⬜ Itens mágicos por nível (DMG tables)
- ⬜ Modo campanha vs modo simplificado (equipamento)

### Decisões de produto (confirmar antes de codar)

- ⬜ PV: máximo por nível (default) vs média
- ⬜ Equipamento nível 2+: ouro vs pacote background
- ⬜ Wizard spellbook: migration vs fórmula hardcoded temporária
- ⬜ Magias: UI por nível desbloqueado vs “escolha tudo de uma vez”
- ⬜ Subclasse no passo Classe vs aba Escolhas

---

## 1. Objetivo

Permitir que o jogador crie um personagem **já em qualquer nível de personagem (1–20)**, com todas as escolhas obrigatórias resolvidas no wizard — não apenas “criar nível 1 e subir depois”.

**Critério de sucesso:** ao finalizar o builder, a ficha reflete o nível escolhido: PV, bônus de proficiência, slots, recursos (`sync_character_resources`), magias, subclasse, feats e perícias coerentes com as regras SRD 2024.

**Fora de escopo inicial (fase posterior):** multiclasse, edição pós-criação via level-up UI, compra de equipamento com ouro (loja), itens mágicos por nível.

---

## 2. Princípios (alinhados ao projeto)

| Princípio | Implicação |
| --- | --- |
| App rola o d20; banco persiste estado | Builder **monta payload**; `create_character` persiste. Sem RPC de rolagem. |
| Catálogo Tier 2 cacheável | Progressão (slots, spell knowledge, recursos) vem de views/tabelas read-only. |
| Rotas finas | Lógica em `features/character-builder/domain/`; `app/` só compõe. |
| Uma feature vertical | Tudo em `features/character-builder/`; export via `index.ts`. |

---

## 3. Estado atual (baseline nível 1)

### 3.1 O que já funciona

| Camada | Situação |
| --- | --- |
| **RPC `create_character`** | Aceita `classes[].class_level`, calcula `level` total, `proficiency_bonus`, proficiências de classe/background, skills, feats, spells, trait_options, inventário; chama `sync_character_spell_slots` e `sync_character_resources`. |
| **RPC `level_up_character`** | Sobe nível de uma classe existente (ou entra multiclasse em nível 1); aceita `p_choices` com `trait_options` e `trait_spell_choices`. **Não usado pelo builder hoje.** |
| **Dados de progressão** | `spell_knowledge_by_level`, `spell_slot_progressions`, `trait_resources`, `class_traits`, `subclass_traits`, `class_spellcasting`. |
| **Builder UI** | Wizard 6 passos: Atributos → Espécie → Antecedente → Classe → Escolhas → Detalhes. |
| **Escolhas nível 1** | Perícias de classe, ferramentas, truques/preparadas/grimório Lv1, expertise (ex.: Ladino), feats de origem, equipamento de background. |

### 3.2 O que está hardcoded

| Item | Local | Problema |
| --- | --- | --- |
| `BUILDER_CLASS_LEVEL = 1` | `server/types.ts` | Expertise e contagens de magia ignoram nível escolhido. |
| `BUILDER_SPELL_LEVEL = 1` | `domain/spells/class-spells.ts` | Validação e pools só magias de nível 1. |
| `WIZARD_SPELLBOOK_LEVEL1_COUNT = 6` | idem | Grimório do Mago não escala. |
| `class_level: 1` | `domain/payload.ts`, `lib/character/map-row.ts` | RPC sempre cria nível 1. |
| `computeLevel1Hp` | `domain/abilities/abilities.ts` | PV só do 1º nível. |
| Subclasse | — | Não existe no `CharacterBuilderState`. |
| ASI / feats de progressão | — | Níveis 4, 8, 12, 16, 19 não tratados. |
| Escolhas opcionais por nível | — | Metamagic, Invocações, Maneuvers, Fighting Style swaps, etc. |
| `class_level` na API | `builder-data?scope=details` | Detalhes não recarregam por nível. |

---

## 4. Ideia central: “simular level-up acumulado”

Em vez de duplicar regras, o builder deve **reproduzir o que aconteceria** se o personagem tivesse subido do nível 1 até o nível alvo, consolidando escolhas num único payload de `create_character`.

```text
┌─────────────────────────────────────────────────────────────┐
│  Builder State                                              │
│  class_level, subclass_id, spell_selections[],              │
│  asi_choices[], optional_trait_choices[], …                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  domain/build-progression.ts  (NOVO)                        │
│  • Quais escolhas são obrigatórias até level N?             │
│  • Quanto HP / quantas magias / quantos feats?              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  buildRpcPayloadFromBuilderState → create_character         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  sync_character_spell_slots + sync_character_resources      │
│  (automático no RPC — slots e Rage/Ki/etc. por nível)       │
└─────────────────────────────────────────────────────────────┘
```

**Alternativa descartada para v1:** criar em nível 1 e chamar `level_up_character` N−1 vezes. Funciona mecanicamente, mas UX ruim, múltiplos round-trips e validação fragmentada.

---

## 5. Taxonomia de classes

### 5.1 Não conjuradores (sem aba Magias de classe)

| Classe | Escolhas extras além de perícias |
| --- | --- |
| **Barbarian** | Subclasse (3+); sem magias de classe. Recursos: Rage (automático via `sync_character_resources`). |
| **Fighter** | Subclasse (3+); Fighting Style (nível 1, trocável depois — registro inicial); Battle Master → Maneuvers; Psi Warrior → dados psíonicos. |
| **Monk** | Subclasse (3+); Focus Points automáticos. |
| **Rogue** | Subclasse (3+); Expertise em 1 e 6 (escolhas de perícia). |

**Builder:** aba Magias só se feat de origem/humano exigir. Foco em **Subclasse**, **Expertise** (níveis múltiplos) e **feats de progressão**.

### 5.2 Meio-conjuradores (half / third)

| Classe | Progressão | Magias na criação |
| --- | --- | --- |
| **Paladin** | `half` slots, `paladin-prepared` | Preparadas sobem por nível; sem truques iniciais (`cantrip: none`). |
| **Ranger** | `half` slots, `ranger-prepared` | Idem Paladin. |

**Builder:** aba Magias com pool de **preparadas acumuladas** até o nível alvo (contagem em `spell_knowledge_by_level`). Slots preenchidos pelo sync pós-criação.

### 5.3 Conjuradores completos (full)

| Classe | Truques | Preparadas | Grimório |
| --- | --- | --- | --- |
| **Bard** | `bard` | `bard-prepared` | — |
| **Cleric** | `cleric` | `cleric-prepared` | — |
| **Druid** | `druid` | `druid-prepared` | — |
| **Sorcerer** | `sorcerer` | `sorcerer-prepared` | — |
| **Wizard** | `wizard` | `wizard-prepared` | **Sim** (`uses_spellbook`) |

**Regra PHB 2024 (Wizard):** ao subir de nível, adiciona **2 magias** ao grimório (níveis que você pode preparar). Nível 1 = 6 magias Lv1. **Não há tabela `spellbook_by_level` no banco hoje** — precisa derivar ou seedar.

### 5.4 Warlock (caso especial)

| Aspecto | Detalhe |
| --- | --- |
| Slots | `pact` — recuperam em descanso curto; nível efetivo de slot ≠ nível de classe |
| Truques / preparadas | `warlock` + `warlock-prepared` |
| Invocações | `warlock-invocations` em `spell_knowledge_by_level`; escolhas desde nível 2 |
| Pact Boon | Nível 2 — trait opcional (Blade / Chain / Tome) |
| Subclasse | Nível 3 (Patron) |

**Builder:** aba Magias + aba **Invocações** (ou sub-aba) + subclasse.

### 5.5 Sorcerer (Metamagic)

Escolhas de **Metamagic** desde nível 2 (`class_traits` opcionais em `000027`). Duas escolhas iniciais; mais conforme nível.

---

## 6. Escolhas por categoria e quando aparecem

### 6.1 Sempre (qualquer nível)

| Escolha | Nível | Onde no builder |
| --- | --- | --- |
| Atributos base + ASI de background | — | Passo Atributos / Antecedente |
| Espécie + traiços obrigatórios | — | Passo Espécie |
| Antecedente + feat de origem | — | Passo Antecedente / Escolhas |
| Classe + **nível alvo** | — | Passo Classe (novo controle) |
| Perícias de classe (nível 1) | 1 | Escolhas → Perícias |
| Ferramentas de classe / background | 1 | Escolhas → Perícias / Traços |

### 6.2 A partir do nível 3 (quase todas as classes)

| Escolha | Dado no banco |
| --- | --- |
| **Subclasse** | `subclasses`, `subclass_traits`; `character_classes.subclass_id` no payload |
| Escolhas de subclasse nível 3 | Ex.: Maneuvers (Battle Master), opções em `trait_options` |

**Regra UI:** se `class_level >= 3` → subclasse **obrigatória** antes de avançar.

### 6.3 Feats de progressão (SRD 2024)

Níveis **4, 8, 12, 16:** ASI **ou** General Feat.  
Nível **19:** Epic Boon **ou** General Feat (`class_traits`: `*: Epic Boon`).

| Feat | Catálogo | Escolhas internas |
| --- | --- | --- |
| Ability Score Improvement | `feats` + `trait_options` | Modo +2/+1 ou +1/+1/+1 (já modelado no seed) |
| General / Epic Boon | `feats`, filtros por prerequisito | Perícias, magias, trait_options |

**Gap:** não há tabela `class_feat_slots_by_level`. Derivar em código:

```typescript
const FEAT_CHOICE_LEVELS = [4, 8, 12, 16, 19] as const;
function featChoicesRequired(classLevel: number): number {
  return FEAT_CHOICE_LEVELS.filter((l) => l <= classLevel).length;
}
```

**State novo (proposta):**

```typescript
type ProgressionFeatChoice = {
  at_level: 4 | 8 | 12 | 16 | 19;
  kind: "asi" | "feat";
  feat_id?: number;
  asi_mode?: "plus_two_plus_one" | "triple_plus_one";
  asi_abilities?: Partial<Record<AbilityKey, number>>; // deltas aplicados
  trait_options?: TraitOptionSelection[];
  feat_spell_selections?: FeatSpellSelection[];
};
```

### 6.4 Expertise (perícias)

| Classe | Níveis com escolha | Fonte |
| --- | --- | --- |
| Rogue | 1, 6 | `class_traits` + parser em `class-expertise.ts` |
| Bard | 2, 9 | idem |
| Ranger (Deft Explorer) | 2 | idem |
| Feats (Observant, etc.) | — | via feat de progressão |

**Hoje:** `fetch-class-expertise` usa `level_required <= BUILDER_CLASS_LEVEL (1)`.

**Correção:** `level_required <= state.class_level` e agrupar **múltiplos grupos** por trait/nível.

### 6.5 Magias de classe

Para cada nível `L` de 1 até `class_level`, calcular **delta** de conhecimento:

```typescript
type SpellProgressionSnapshot = {
  cantrips_known: number;      // spell_knowledge @ L
  spells_prepared: number;     // spell_knowledge @ L
  spellbook_total?: number;    // wizard: f(L), ver seção 7.2
};

type SpellSelectionBucket = {
  /** Nível em que esta escolha foi "desbloqueada" */
  unlocked_at_level: number;
  kind: "cantrip" | "prepared" | "spellbook_add" | "always_known";
  max_spell_level: number;     // maior nível de slot disponível naquele L
  selected_spell_ids: number[];
};
```

**Validação acumulada:**

- Truques: total selecionado === `cantrips_known` @ class_level.
- Preparadas: total === `spells_prepared` @ class_level; cada magia ≤ slot máximo.
- Grimório (Wizard): total === `spellbook_total`; preparadas ⊆ grimório.

**UI:** agrupar por “nível em que ganhou a escolha” ou wizard simplificado “escolha seu grimório completo + preparadas atuais”.

### 6.6 Traços opcionais de classe (não subclasse)

Registrados em `class_traits` / seeds `000027`:

| Classe | Exemplos | Primeiro nível |
| --- | --- | --- |
| Sorcerer | Metamagic (10 opções) | 2 |
| Warlock | Eldritch Invocations, Pact Boon | 2 |
| Fighter | Maneuvers (Battle Master) | 3 |
| Cleric | Divine Order, Primal Order | 1 |

**Abordagem:** módulo `domain/optional-features/` que, dado `(class_id, class_level)`, lista grupos com `choice_count` e opções de `traits` filtradas por `level_required`.

### 6.7 Equipamento

| Nível | Regra SRD (criação acelerada) |
| --- | --- |
| 1 | Pacote A/B do background (já implementado) |
| 2+ | **Substituir** por ouro inicial proporcional ao nível (tabela DMG) — **não seedada** |

**Proposta v1:** nível 1 → equipamento de background; nível 2+ → opção “Usar ouro inicial (X gp)” sem loja, ou manter equipamento de background como simplificação (documentar desvio).

---

## 7. Gaps no banco de dados

### 7.1 Já existe e basta parametrizar por `class_level`

- `spell_knowledge_by_level` — truques e preparadas por classe/nível
- `v_class_spell_slots` / `spell_slot_progressions` — slots (sync automático)
- `trait_resources` + `sync_character_resources` — Rage, Ki, Channel Divinity, etc.
- `class_traits` / `subclass_traits` — features passivas (sem escolha)
- `create_character` — aceita `subclass_id` em `classes[]`

### 7.2 Falta ou incompleto

| Gap | Impacto | Ação sugerida |
| --- | --- | --- |
| **Grimório do Mago por nível** | Wizard L5+ errado | Migration: tabela `spellbook_spells_by_level` ou fórmula documentada (+2 por nível após 1º; +6 no L1) |
| **Ouro inicial por nível** | Equipamento alto nível | Migration ou constantes em `domain/equipment/starting-gold.ts` |
| **Prerequisitos de feat** | Filtrar feats elegíveis | Parser de `feats.prerequisites` ou view `v_feat_eligibility` |
| **Subclasse nível de desbloqueio** | Hoje assume 3 | Constante global ou coluna `subclasses.unlock_level` (todas 3 no SRD 2024) |
| **Magical Secrets (Bard 10)** | Magias de outras listas | Escolha cross-list; requer UI + validação extra |
| **Multiclasse** | — | Fora do escopo v1; `create_character` já aceita múltiplas classes |

### 7.3 O que **não** precisa de migration (automático pós-criação)

- Slots de magia → `sync_character_spell_slots`
- Cargas Rage / Second Wind / etc. → `sync_character_resources`
- Bônus de proficiência → `proficiency_bonus_for_level(total_level)`
- Traits passivas de classe até nível N → derivadas de `class_traits` + `subclass_traits` via views da ficha (desde que `subclass_id` e nível estejam corretos)

---

## 8. Arquitetura frontend proposta

### 8.1 State estendido

```typescript
// Adições a CharacterBuilderState
class_level: number;                    // 1–20, default 1
subclass_id: number | null;

// Substituir listas flat de magia por estrutura acumulativa (ou manter flat + metadados)
spell_selections: SpellSelectionBucket[];

// Feats de progressão (4/8/12/16/19)
progression_feat_choices: ProgressionFeatChoice[];

// Metamagic, Invocations, Maneuvers, etc.
optional_feature_choices: TraitOptionSelection[];

// HP: default "max por nível"
hp_mode: "max" | "average";             // v1: só "max"
```

### 8.2 Novos módulos de domínio

| Arquivo | Responsabilidade |
| --- | --- |
| `domain/progression/levels.ts` | Constantes: FEAT_CHOICE_LEVELS, SUBCLASS_UNLOCK, etc. |
| `domain/progression/hp.ts` | `computeMaxHp(hitDie, conMod, classLevel, hpMode)` |
| `domain/progression/spell-progression.ts` | Deltas de spell knowledge; totais Wizard spellbook |
| `domain/progression/required-choices.ts` | `getRequiredChoiceGroups(class, level)` → tabs/steps dinâmicos |
| `domain/progression/feats.ts` | Validar ASI vs feat; aplicar deltas de atributo |
| `domain/payload.ts` | Estender build + `toCreateCharacterRpcBody` com `class_level`, `subclass_id` |

### 8.3 Server / API

| Mudança | Detalhe |
| --- | --- |
| `GET /api/characters/builder-data?class_level=N` | Repassar para `fetchCharacterBuilderDetails` |
| `fetch-class-spellcasting.ts` | Trocar `BUILDER_CLASS_LEVEL` por parâmetro |
| `fetch-class-expertise.ts` | idem |
| `fetch-optional-features.ts` | **Novo** — Metamagic, Invocations, Maneuvers |
| `fetch-feats-for-level.ts` | **Novo** — feats elegíveis por nível/atributos |

### 8.4 UI / passos do wizard

**Opção A (menor churn):** manter 6 passos; enriquecer passo Classe + Escolhas.

**Opção B (recomendada):** passo Escolhas vira **sub-wizard dinâmico** guiado por `required-choices`:

```text
Passo Classe
  ├── Seletor nível 1–20
  ├── Cards de classe (facts atualizados por nível: magias totais, expertise, feats)
  └── Subclasse (visível se level >= 3)

Passo Escolhas (tabs dinâmicas)
  ├── Perícias (+ expertise por nível)
  ├── Subclasse (manobras, etc.)     [se aplicável]
  ├── Magias                         [casters / half-casters]
  ├── Invocações / Metamagic         [Warlock / Sorcerer]
  ├── Feats (origem + progressão)    [4/8/12/16/19]
  ├── Traços (espécie + background)
  └── Equipamento / ouro
```

**Preview lateral:** mostrar nível, PV estimado, bônus de proficiência, contagem de slots (read-only da view).

### 8.5 Fluxo de recarga de catálogo

Chave de detalhes hoje: `class_id:species_id:background_id`.

Nova chave: **`class_id:species_id:background_id:class_level`**.

Ao mudar `class_level` ou `class_id`:

1. Resetar escolhas dependentes (magias, expertise, feats de progressão, subclasse se level < 3).
2. Recarregar `scope=details` com novo nível.

---

## 9. Payload RPC (`create_character`)

### 9.1 Campos existentes — alterações

```json
{
  "name": "Aldric",
  "species_id": 1,
  "background_id": 1,
  "max_hp": 45,
  "current_hp": 45,
  "abilities": { "STR": 16, "DEX": 12, "CON": 14, "INT": 10, "WIS": 13, "CHA": 8 },
  "classes": [{
    "class_id": 3,
    "class_level": 5,
    "subclass_id": 12
  }],
  "skills": [ … ],
  "feats": [
    { "feat_id": 1, "source_type": "background", "source_id": 1 },
    { "feat_id": 42, "source_type": "class", "source_id": 3, "selection_key": "level_4" }
  ],
  "spells": [ … ],
  "trait_options": [ … ],
  "trait_spell_choices": [ … ],
  "inventory": [ … ]
}
```

### 9.2 Cálculo de PV (proposta)

```typescript
function computeMaxHp(hitDie: string, conMod: number, level: number, mode: "max"): number {
  const die = hitDieMax(hitDie);
  const first = Math.max(1, die + conMod);
  if (level <= 1) return first;
  const perLevel = Math.max(1, die + conMod); // regra "max" DMG
  return first + (level - 1) * perLevel;
}
```

Modo `average`: `first + (level-1) * (Math.floor(die/2)+1+conMod)`.

---

## 10. Matriz casters × mecânica de magia

| Classe | Truques @ L | Preparadas @ L | Grimório | Slots @ L | Escolhas extras de magia |
| --- | --- | --- | --- | --- | --- |
| Wizard | `wizard` | `wizard-prepared` | 6 + 2×(L−1)¹ | full | Magias ao subir nível (Lv ≤ slot) |
| Cleric | `cleric` | `cleric-prepared` | — | full | Troca preparadas livremente² |
| Druid | `druid` | `druid-prepared` | — | full | idem |
| Bard | `bard` | `bard-prepared` | — | full | Magical Secrets @ 10 |
| Sorcerer | `sorcerer` | `sorcerer-prepared` | — | full | — |
| Warlock | `warlock` | `warlock-prepared` | — | pact | Invocações com magia (Armour of Shadows…) |
| Paladin | 0 | `paladin-prepared` | — | half | Preparadas limitadas |
| Ranger | 0 | `ranger-prepared` | — | half | idem |

¹ Fórmula PHB; validar com seed ou migration.  
² Na criação, jogador define conjunto preparado inicial (= total permitido).

---

## 11. Matriz não casters × escolhas principais

| Classe | Subclasse @ 3 | Escolhas nível 1–2 | Escolhas nível 4+ |
| --- | --- | --- | --- |
| Barbarian | Path | Perícias, armas | Feats 4/8/12/16/19 |
| Fighter | Martial Archetype | Fighting Style | Feats + Maneuvers (BM) |
| Monk | Warrior of… | Perícias | Feats |
| Rogue | Archetype | Perícias, Expertise×2 @1 | Expertise×2 @6, Feats |

---

## 12. Fases de implementação

> **Checklist detalhado:** ver [Checklist completo](#checklist-completo) no topo do documento.

| Fase | Foco | Entrega mínima |
| --- | --- | --- |
| **1** | Infraestrutura | `class_level`, PV, payload, fetches parametrizados, preview |
| **2** | Escolhas de jogo | Subclasse, expertise multi-nível, magias acumuladas, grimório Wizard |
| **3** | Progressão completa | Feats 4/8/12/16/19, Metamagic/Invocations/Maneuvers, Magical Secrets, equipamento |
| **4** | Polish | Multiclasse, level-up UI, E2E por arquétipo, import/export |

---

## 13. Decisões recomendadas (defaults)

| Decisão | Default proposto |
| --- | --- |
| PV | Máximo em cada nível |
| Subclasse | Obrigatória se level ≥ 3 |
| ASI/Feats | Obrigatórios nos níveis 4/8/12/16/19 antes de criar |
| Equipamento alto nível | v1: manter pacote background + nota de simplificação; v2: ouro |
| Multiclasse | Fora do escopo até Fase 4 |
| Wizard spellbook | Migration com tabela explícita (preferível a hardcode) |

---

## 14. Arquivos a tocar (checklist)

### Domain / types

- `types/builder.types.ts` — state, payloads, tipos de progressão
- `domain/state/state.ts` — initial state, resets por `class_level`
- `domain/state/validation.ts` — regras por nível
- `domain/payload.ts` — HP, class_level, feats acumulados
- `domain/spells/class-spells.ts` — generalizar além de Lv1
- `domain/abilities/abilities.ts` — `computeMaxHp`
- **Novos** em `domain/progression/*`

### Server

- `server/types.ts` — remover constante fixa; `BuilderDetailsRequest.class_level`
- `server/fetch-class-spellcasting.ts`
- `server/fetch-class-expertise.ts`
- `server/fetch-optional-features.ts` (novo)
- `server/index.ts`
- `app/api/characters/builder-data/route.ts`

### UI

- `components/steps/StepClass.tsx` — seletor de nível + subclasse
- `components/steps/StepChoices.tsx` + tabs
- `components/steps/choices/ChoicesSpellsTab.tsx` — pools multi-nível
- `components/steps/choices/ChoicesFeatsTab.tsx` — feats de progressão
- **Novos** `ChoicesSubclassTab`, `ChoicesInvocationsTab`, etc.
- `components/shell/BuilderPreviewPanel.tsx`
- `components/CharacterBuilderWizard.tsx` — details key com level
- `services/builder.service.ts` — query param `class_level`

### Lib / legacy

- `lib/character/map-row.ts` — remover hardcode nível 1

### Database (se Fase 2+)

- Migration `spellbook_spells_by_level` ou similar
- Opcional: `starting_gold_by_level`

---

## 15. Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| Wizard spellbook sem tabela | Migration antes de Fase 2 casters |
| UI explode em combinações | Tabs dinâmicas só para escolhas `required > 0` |
| Atributos pós-ASI incorretos | `computePreviewAbilities` aplicar background + progression ASI |
| Feats com prerequisito complexo | Filtrar no server; mensagem clara na UI |
| Desvio de regras de equipamento | Documentar; toggle “modo campanha” futuro |

---

## 16. Referências no repo

- Contrato RPC: `database/docs/schema.md` (Tier 2 criação)
- Regra de domínio: `.cursor/rules/dnd-domain.mdc`
- `create_character`: `database/migrations/000039_fix_create_character_background_skills.sql`
- `level_up_character`: `database/migrations/000010_rpcs.sql`
- Spell knowledge seed: `database/migrations/000033_seed_018_dnd_2024_spell_knowledge.sql`
- Class traits / subclasses: `database/migrations/000023_seed_008_dnd_2024_class_traits.sql`
- Optional features: `database/migrations/000027_seed_012_dnd_2024_optional_features.sql`
- Builder atual: `features/character-builder/`

---

*Última atualização: jun/2026 — Fases 1–3 implementadas; Fase 4 (multiclasse, E2E) pendente.*
