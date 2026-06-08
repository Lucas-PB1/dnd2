"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import {
  BuilderSectionTabs,
  BuilderStepFrame,
  ChipToggle,
  SelectionCard,
} from "@/features/character/components/builder/BuilderParts";
import { BuilderDetailModal } from "@/features/character/components/builder/BuilderDetailModal";
import {
  OriginFeatDetailContent,
  TraitOptionDetailContent,
} from "@/features/character/components/builder/builder-detail-content";
import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
  BuilderSpellOption,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character/types/builder.types";
import {
  classRequiresExpertiseSelection,
  classRequiresSpellSelection,
  getExpertiseSelectionsForTrait,
  selectionKey,
  setBackgroundTool,
  setClassTool,
  setHumanOriginFeat,
  toggleCantripSpell,
  toggleClassSkill,
  toggleExpertiseSkill,
  toggleHumanOriginFeatTraitOption,
  toggleOriginFeatTraitOption,
  togglePreparedSpell,
  toggleSpeciesTraitOption,
  toggleSpellbookSpell,
  totalExpertiseChoicesRequired,
} from "@/features/character/hooks/useCharacterBuilder";
import { eligibleSkillsForExpertiseGroup } from "@/lib/character/class-expertise";
import {
  cantripsForClass,
  level1SpellsForClass,
} from "@/lib/character/class-spells";
import {
  featRequiresSpellSelection,
  getFeatSpellSelectionsForSource,
  resolveFeatSpellListSelection,
  spellsForFeatGroup,
  toggleFeatSpellInGroup,
  totalFeatSpellChoicesRequired,
} from "@/lib/character/feat-spells";
import {
  spellIdsTakenElsewhere,
  skillIdsGrantedOutsideClass,
  visibleHumanOriginFeats,
  visibleSpells,
  visibleTraitOptions,
  visibleWhenTaken,
} from "@/lib/character/builder-selection";
import {
  findLockedOriginFeatSelection,
  getVisibleOriginFeatChoices,
  mergeOriginFeatTraitOptions,
} from "@/lib/character/origin-feat";

type StepChoicesProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

type ChoiceTab = "skills" | "spells" | "traits" | "feats" | "gear";

function spellChipLabel(spell: BuilderSpellOption): string {
  const tags: string[] = [];
  if (spell.requires_concentration) tags.push("Conc.");
  if (spell.requires_ritual) tags.push("Ritual");
  const suffix = tags.length > 0 ? ` (${tags.join(", ")})` : "";
  return `${spell.name}${suffix}`;
}

function SpellPickerSection({
  title,
  hint,
  spells,
  selectedIds,
  max,
  disabledIds = [],
  filter,
  onFilterChange,
  onToggle,
}: {
  title: string;
  hint: string;
  spells: BuilderSpellOption[];
  selectedIds: number[];
  max: number;
  disabledIds?: number[];
  filter: string;
  onFilterChange: (value: string) => void;
  onToggle: (spellId: number) => void;
}) {
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredSpells = normalizedFilter
    ? spells.filter((spell) =>
        spell.name.toLowerCase().includes(normalizedFilter),
      )
    : spells;

  return (
    <section>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted">
        {hint} — {selectedIds.length}/{max}
      </p>
      {spells.length > 12 ? (
        <Input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder="Filtrar magias…"
          className="mt-2 h-8 text-sm"
          aria-label={`Filtrar ${title.toLowerCase()}`}
        />
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {filteredSpells.map((spell) => {
          const selected = selectedIds.includes(spell.spell_id);
          const disabled =
            disabledIds.includes(spell.spell_id) ||
            (!selected && selectedIds.length >= max);
          return (
            <ChipToggle
              key={spell.spell_id}
              label={spellChipLabel(spell)}
              selected={selected}
              disabled={disabled}
              onToggle={() => onToggle(spell.spell_id)}
            />
          );
        })}
      </div>
      {filteredSpells.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Nenhuma magia encontrada.</p>
      ) : null}
    </section>
  );
}

function FeatSpellPicker({
  title,
  featLabel,
  spellcasting,
  traitOptions,
  originFeatChoices,
  lockedSpellListName,
  source,
  state,
  onChange,
  filter,
  onFilterChange,
}: {
  title: string;
  featLabel: string;
  spellcasting: BuilderFeatSpellcasting;
  traitOptions: TraitOptionSelection[];
  originFeatChoices: BuilderOriginFeatChoice[];
  lockedSpellListName?: string | null;
  source: FeatSpellSource;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}) {
  const listSelection = resolveFeatSpellListSelection(
    spellcasting,
    traitOptions,
    originFeatChoices,
    lockedSpellListName,
  );

  if (!listSelection) {
    return (
      <section>
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted">
          Escolha a lista de magias do talento {featLabel} na aba Feats antes de
          selecionar as magias.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-border/60 p-3">
      <div>
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted">
          {featLabel} — lista {listSelection.listName}
        </p>
      </div>
      {spellcasting.groups.map((group) => {
        const spells = spellsForFeatGroup(
          spellcasting,
          listSelection.listName,
          group.spell_level,
        );
        const selected = getFeatSpellSelectionsForSource(
          state,
          source,
          group.trait_id,
          group.choice_group,
        );
        const selectedIds = selected.map((entry) => entry.spell_id);
        const groupTitle =
          group.spell_level === 0
            ? "Truques do talento"
            : group.always_prepared
              ? "Magia de nível 1 (sempre preparada)"
              : `Magias de talento (${group.choice_group})`;

        const takenSpellIds = spellIdsTakenElsewhere(state, {
          featSources: [source],
        });

        return (
          <SpellPickerSection
            key={`${source}-${group.choice_group}`}
            title={groupTitle}
            hint={
              group.notes ??
              `Escolha ${group.choice_count} magia(s) da lista ${listSelection.listName}`
            }
            spells={visibleSpells(spells, selectedIds, takenSpellIds)}
            selectedIds={selectedIds}
            max={group.choice_count}
            filter={filter}
            onFilterChange={onFilterChange}
            onToggle={(spellId) =>
              onChange(
                toggleFeatSpellInGroup(state, {
                  source,
                  trait_id: group.trait_id,
                  choice_group: group.choice_group,
                  choice_count: group.choice_count,
                  spell_level: group.spell_level,
                  spell_id: spellId,
                }),
              )
            }
          />
        );
      })}
    </section>
  );
}

export function StepChoices({ data, state, onChange }: StepChoicesProps) {
  const [activeTab, setActiveTab] = useState<ChoiceTab>("skills");
  const [cantripFilter, setCantripFilter] = useState("");
  const [spellbookFilter, setSpellbookFilter] = useState("");
  const [preparedFilter, setPreparedFilter] = useState("");
  const [featSpellFilter, setFeatSpellFilter] = useState("");
  const [modalFeat, setModalFeat] = useState<{
    title: string;
    content: "origin" | "trait";
    traitOption?: BuilderTraitOption;
    featId?: number;
  } | null>(null);

  const cls = data.classes.find((c) => c.id === state.class_id);
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );
  const hasClassSpells = classRequiresSpellSelection(cls?.spellcasting);
  const hasBackgroundFeatSpells = featRequiresSpellSelection(
    background?.origin_feat_spellcasting,
  );
  const hasHumanFeatSpells = featRequiresSpellSelection(humanFeat?.spellcasting);
  const hasSpells =
    hasClassSpells || hasBackgroundFeatSpells || hasHumanFeatSpells;

  const tabs = useMemo(() => {
    if (!cls || !species || !background) return [];

    const maxSkills = cls.skill_choices.reduce((s, g) => s + g.choice_count, 0);
    const traitGroups = species.traits.flatMap((trait) =>
      trait.choice_groups
        .filter((g) => g.is_required)
        .map((group) => ({ trait, group })),
    );
    const lockedOriginFeat = findLockedOriginFeatSelection(background);
    const visibleOriginFeatChoices = getVisibleOriginFeatChoices(background);
    const hasFeats =
      species.name === "Human" ||
      lockedOriginFeat !== null ||
      visibleOriginFeatChoices.length > 0;
    const hasGear = background.equipment_options.length > 0;
    const spellcasting = cls.spellcasting;

    const items: { id: ChoiceTab; label: string; badge?: string }[] = [];

    const expertiseGroups = cls.expertise_choices ?? [];
    const hasExpertise = classRequiresExpertiseSelection(expertiseGroups);
    const expertiseRequired = totalExpertiseChoicesRequired(expertiseGroups);
    const expertiseSelected = expertiseGroups.reduce(
      (sum, group) =>
        sum + getExpertiseSelectionsForTrait(state, group.trait_id).length,
      0,
    );

    if (maxSkills > 0 || cls.tool_choices.length > 0 || hasExpertise) {
      const badges: string[] = [];
      if (maxSkills > 0) {
        badges.push(`${state.class_skill_ids.length}/${maxSkills}`);
      }
      if (hasExpertise) {
        badges.push(`Exp. ${expertiseSelected}/${expertiseRequired}`);
      }
      items.push({
        id: "skills",
        label: "Perícias",
        badge: badges.length > 0 ? badges.join(" · ") : undefined,
      });
    }

    if (hasSpells) {
      const classRequired = spellcasting
        ? spellcasting.cantrip_count +
          spellcasting.spellbook_count +
          spellcasting.prepared_count
        : 0;
      const classSelected = spellcasting
        ? state.cantrip_spell_ids.length +
          state.spellbook_spell_ids.length +
          state.prepared_spell_ids.length
        : 0;
      const featRequired =
        totalFeatSpellChoicesRequired(background.origin_feat_spellcasting) +
        totalFeatSpellChoicesRequired(humanFeat?.spellcasting);
      const featSelected = state.feat_spell_selections.length;
      const totalRequired = classRequired + featRequired;
      const totalSelected = classSelected + featSelected;
      items.push({
        id: "spells",
        label: "Magias",
        badge: totalRequired > 0 ? `${totalSelected}/${totalRequired}` : undefined,
      });
    }

    if (traitGroups.length > 0 || background.tool_proficiency_options.some((o) => !o.tool_id)) {
      items.push({ id: "traits", label: "Traços" });
    }

    if (hasFeats) {
      items.push({ id: "feats", label: "Feats" });
    }

    if (hasGear) {
      items.push({
        id: "gear",
        label: "Equipamento",
        badge: state.equipment_option_key ?? undefined,
      });
    }

    return items;
  }, [
    cls,
    species,
    background,
    state.class_skill_ids.length,
    state.cantrip_spell_ids.length,
    state.spellbook_spell_ids.length,
    state.prepared_spell_ids.length,
    state.expertise_by_trait,
    state.equipment_option_key,
    state.feat_spell_selections.length,
    state.human_origin_feat_id,
    background?.origin_feat_spellcasting,
    humanFeat?.spellcasting,
  ]);

  const resolvedTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "skills");

  if (!cls || !species || !background) {
    return (
      <BuilderStepFrame title="Escolhas">
        <p className="text-sm text-muted">
          Complete os passos anteriores antes de fazer escolhas.
        </p>
      </BuilderStepFrame>
    );
  }

  const skillGroups = cls.skill_choices;
  const maxSkills = skillGroups.reduce((s, g) => s + g.choice_count, 0);
  const allExpertiseSelected = cls.expertise_choices.flatMap((group) =>
    getExpertiseSelectionsForTrait(state, group.trait_id),
  );
  const classToolIds = state.class_tool_selections
    .map((tool) => tool.tool_id)
    .filter((id): id is number => id !== null);
  const lockedOriginFeat = findLockedOriginFeatSelection(background);
  const visibleOriginFeatChoices = getVisibleOriginFeatChoices(background);
  const traitGroups = species.traits.flatMap((trait) =>
    trait.choice_groups
      .filter((g) => g.is_required)
      .map((group) => ({ trait, group })),
  );

  return (
    <>
      <BuilderStepFrame
        title="Escolhas"
        hint="Use as abas para alternar entre perícias, magias, traços, feats e equipamento."
      >
        {tabs.length > 0 ? (
          <BuilderSectionTabs
            tabs={tabs}
            activeId={resolvedTab}
            onChange={(id) => setActiveTab(id as ChoiceTab)}
          />
        ) : null}

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {resolvedTab === "skills" ? (
            <div className="space-y-4">
              {maxSkills > 0 ? (
                <section>
                  <p className="text-xs text-muted">
                    Perícias de classe — escolha {maxSkills}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skillGroups.flatMap((group) =>
                      visibleWhenTaken(
                        group.options,
                        state.class_skill_ids,
                        [
                          ...state.class_skill_ids,
                          ...skillIdsGrantedOutsideClass(data, state),
                        ],
                        (skill) => skill.skill_id,
                      ).map((skill) => (
                        <ChipToggle
                          key={`${group.choice_group}-${skill.skill_id}`}
                          label={skill.name}
                          selected={state.class_skill_ids.includes(skill.skill_id)}
                          disabled={
                            !state.class_skill_ids.includes(skill.skill_id) &&
                            state.class_skill_ids.length >= maxSkills
                          }
                          onToggle={() =>
                            onChange(toggleClassSkill(state, data, skill.skill_id))
                          }
                        />
                      )),
                    )}
                  </div>
                </section>
              ) : null}

              {cls.expertise_choices.map((group) => {
                const selected = getExpertiseSelectionsForTrait(
                  state,
                  group.trait_id,
                );
                const eligible = eligibleSkillsForExpertiseGroup(
                  data,
                  state,
                  group,
                );

                return (
                  <section key={group.trait_id}>
                    <p className="text-xs font-medium text-foreground">
                      Expertise — {group.trait_name}
                    </p>
                    <p className="text-xs text-muted">
                      Escolha {group.choice_count} perícia(s) proficiente(s) —{" "}
                      {selected.length}/{group.choice_count}
                    </p>
                    {group.notes ? (
                      <p className="text-xs text-muted">{group.notes}</p>
                    ) : null}
                    {eligible.length === 0 ? (
                      <p className="mt-2 text-xs text-muted">
                        Selecione as perícias de classe antes de escolher
                        expertise.
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {visibleWhenTaken(
                          eligible,
                          selected,
                          allExpertiseSelected.filter(
                            (skillId) => !selected.includes(skillId),
                          ),
                          (skill) => skill.skill_id,
                        ).map((skill) => (
                          <ChipToggle
                            key={`exp-${group.trait_id}-${skill.skill_id}`}
                            label={skill.name}
                            selected={selected.includes(skill.skill_id)}
                            disabled={
                              !selected.includes(skill.skill_id) &&
                              selected.length >= group.choice_count
                            }
                            onToggle={() =>
                              onChange(
                                toggleExpertiseSkill(
                                  state,
                                  group.trait_id,
                                  skill.skill_id,
                                  group.choice_count,
                                ),
                              )
                            }
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}

              {cls.tool_choices.map((group) => {
                const selectedInGroup = state.class_tool_selections
                  .filter(
                    (entry) =>
                      entry.source_type === "class" &&
                      entry.source_id === cls.id,
                  )
                  .map((entry) => entry.tool_id)
                  .filter((id): id is number => id !== null);

                return (
                  <section key={group.option_group}>
                    <p className="text-xs font-medium text-foreground">
                      {group.option_group}
                    </p>
                    {group.notes ? (
                      <p className="text-xs text-muted">{group.notes}</p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {visibleWhenTaken(
                        group.options.filter(
                          (tool): tool is typeof tool & { tool_id: number } =>
                            tool.tool_id !== null,
                        ),
                        selectedInGroup,
                        classToolIds.filter((id) => !selectedInGroup.includes(id)),
                        (tool) => tool.tool_id,
                      ).map((tool) => {
                        const toolId = tool.tool_id;
                        const selected = selectedInGroup.includes(toolId);
                        return (
                          <ChipToggle
                            key={`${group.option_group}-${tool.name}`}
                            label={tool.name}
                            selected={selected}
                            onToggle={() =>
                              onChange(
                                setClassTool(state, {
                                  tool_id: toolId,
                                  name: tool.name,
                                  source_type: "class",
                                  source_id: cls.id,
                                }),
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {resolvedTab === "spells" && hasSpells ? (
            <div className="space-y-4">
              {cls.spellcasting?.spells.length === 0 && hasClassSpells ? (
                <p className="text-sm text-muted">
                  Carregando lista de magias da classe…
                </p>
              ) : null}
              {cls.spellcasting && cls.spellcasting.cantrip_count > 0 ? (
                <SpellPickerSection
                  title="Truques"
                  hint={`Escolha ${cls.spellcasting.cantrip_count} truque(s)`}
                  spells={visibleSpells(
                    cantripsForClass(cls.spellcasting),
                    state.cantrip_spell_ids,
                    spellIdsTakenElsewhere(state, { cantrips: true }),
                  )}
                  selectedIds={state.cantrip_spell_ids}
                  max={cls.spellcasting.cantrip_count}
                  filter={cantripFilter}
                  onFilterChange={setCantripFilter}
                  onToggle={(spellId) =>
                    onChange(toggleCantripSpell(state, data, spellId))
                  }
                />
              ) : null}

              {cls.spellcasting?.uses_spellbook ? (
                <SpellPickerSection
                  title="Grimório"
                  hint={`Adicione ${cls.spellcasting.spellbook_count} magia(s) de nível 1`}
                  spells={visibleSpells(
                    level1SpellsForClass(cls.spellcasting),
                    state.spellbook_spell_ids,
                    spellIdsTakenElsewhere(state, { spellbook: true }),
                  )}
                  selectedIds={state.spellbook_spell_ids}
                  max={cls.spellcasting.spellbook_count}
                  filter={spellbookFilter}
                  onFilterChange={setSpellbookFilter}
                  onToggle={(spellId) =>
                    onChange(toggleSpellbookSpell(state, data, spellId))
                  }
                />
              ) : null}

              {cls.spellcasting && cls.spellcasting.prepared_count > 0 ? (
                <SpellPickerSection
                  title="Magias preparadas"
                  hint={
                    cls.spellcasting.uses_spellbook
                      ? `Escolha ${cls.spellcasting.prepared_count} magia(s) do grimório`
                      : `Escolha ${cls.spellcasting.prepared_count} magia(s) de nível 1`
                  }
                  spells={visibleSpells(
                    cls.spellcasting.uses_spellbook
                      ? level1SpellsForClass(cls.spellcasting).filter((spell) =>
                          state.spellbook_spell_ids.includes(spell.spell_id),
                        )
                      : level1SpellsForClass(cls.spellcasting),
                    state.prepared_spell_ids,
                    spellIdsTakenElsewhere(state, {
                      prepared: true,
                      spellbook: cls.spellcasting.uses_spellbook,
                    }),
                  )}
                  selectedIds={state.prepared_spell_ids}
                  max={cls.spellcasting.prepared_count}
                  filter={preparedFilter}
                  onFilterChange={setPreparedFilter}
                  onToggle={(spellId) =>
                    onChange(togglePreparedSpell(state, data, spellId))
                  }
                />
              ) : null}

              {cls.spellcasting?.uses_spellbook &&
              state.spellbook_spell_ids.length === 0 ? (
                <p className="text-xs text-muted">
                  Adicione magias ao grimório antes de escolher as preparadas.
                </p>
              ) : null}

              {background.origin_feat_spellcasting ? (
                <FeatSpellPicker
                  title="Magias do talento (antecedente)"
                  featLabel={background.origin_feat_name ?? "Talent"}
                  spellcasting={background.origin_feat_spellcasting}
                  traitOptions={mergeOriginFeatTraitOptions(
                    background,
                    state.origin_feat_trait_options,
                  )}
                  originFeatChoices={background.origin_feat_choices}
                  lockedSpellListName={background.origin_feat_selection_key}
                  source="background"
                  state={state}
                  onChange={onChange}
                  filter={featSpellFilter}
                  onFilterChange={setFeatSpellFilter}
                />
              ) : null}

              {humanFeat?.spellcasting ? (
                <FeatSpellPicker
                  title="Magias do talento (Versátil)"
                  featLabel={humanFeat.name}
                  spellcasting={humanFeat.spellcasting}
                  traitOptions={state.human_origin_feat_trait_options}
                  originFeatChoices={humanFeat.origin_feat_choices}
                  source="human"
                  state={state}
                  onChange={onChange}
                  filter={featSpellFilter}
                  onFilterChange={setFeatSpellFilter}
                />
              ) : null}
            </div>
          ) : null}

          {resolvedTab === "traits" ? (
            <div className="space-y-4">
              {background.tool_proficiency_options
                .filter((opt) => !opt.tool_id && opt.tool_category)
                .map((opt) => {
                  const categoryTools =
                    data.tools_by_category[opt.tool_category ?? ""] ?? [];
                  return (
                    <section key={opt.id}>
                      <p className="text-xs font-medium text-foreground">
                        Ferramenta do antecedente
                      </p>
                      <p className="text-xs text-muted">{opt.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {visibleWhenTaken(
                          categoryTools.filter(
                            (tool): tool is typeof tool & { tool_id: number } =>
                              tool.tool_id !== null,
                          ),
                          state.background_tool_selections
                            .map((entry) => entry.tool_id)
                            .filter((id): id is number => id !== null),
                          classToolIds,
                          (tool) => tool.tool_id,
                        ).map((tool) => {
                          const toolId = tool.tool_id;
                          const selected = state.background_tool_selections.some(
                            (entry) => entry.tool_id === toolId,
                          );
                          return (
                            <ChipToggle
                              key={toolId}
                              label={tool.name}
                              selected={selected}
                              onToggle={() =>
                                onChange(
                                  setBackgroundTool(state, {
                                    tool_id: toolId,
                                    name: tool.name,
                                    source_type: "background",
                                    source_id: background.id,
                                  }),
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

              {traitGroups.map(({ trait, group }) => (
                <section key={`${trait.trait_id}-${group.option_group}`}>
                  <p className="text-xs font-medium text-foreground">
                    {trait.name} — {group.option_group}
                  </p>
                  {group.notes ? (
                    <p className="text-xs text-muted">{group.notes}</p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {visibleTraitOptions(
                      group.options,
                      group,
                      data,
                      state,
                      state.species_trait_options,
                    ).map((opt, index) => {
                      const selected = state.species_trait_options.some(
                        (entry) => entry.trait_option_id === opt.trait_option_id,
                      );
                      return (
                        <ChipToggle
                          key={opt.trait_option_id}
                          label={opt.name}
                          selected={selected}
                          disabled={
                            !selected &&
                            state.species_trait_options.filter(
                              (entry) =>
                                entry.trait_id === group.trait_id &&
                                entry.option_group === group.option_group,
                            ).length >= group.choice_count
                          }
                          onInfo={
                            opt.description
                              ? () =>
                                  setModalFeat({
                                    title: opt.name,
                                    content: "trait",
                                    traitOption: opt,
                                  })
                              : undefined
                          }
                          onToggle={() =>
                            onChange(
                              toggleSpeciesTraitOption(
                                state,
                                {
                                  trait_id: group.trait_id,
                                  option_group: group.option_group,
                                  selection_key: selectionKey(
                                    group.option_group,
                                    index,
                                  ),
                                  trait_option_id: opt.trait_option_id,
                                },
                                group.choice_count,
                              ),
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {resolvedTab === "feats" ? (
            <div className="space-y-4">
              {species.name === "Human" ? (
                <section>
                  <p className="text-xs text-muted">
                    Humanos ganham um feat de origem adicional (Versátil).
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {visibleHumanOriginFeats(data, state).map((feat) => (
                      <SelectionCard
                        key={feat.id}
                        compact
                        title={feat.name}
                        description={feat.description}
                        selected={state.human_origin_feat_id === feat.id}
                        onInfo={() =>
                          setModalFeat({
                            title: feat.name,
                            content: "origin",
                            featId: feat.id,
                          })
                        }
                        onSelect={() =>
                          onChange(setHumanOriginFeat(state, feat.id))
                        }
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {humanFeat?.origin_feat_choices.map((group) => (
                <section key={`human-${group.trait_id}-${group.option_group}`}>
                  <p className="text-xs font-medium text-foreground">
                    {humanFeat.name}: {group.trait_name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {visibleTraitOptions(
                      group.options,
                      group,
                      data,
                      state,
                      state.human_origin_feat_trait_options,
                    ).map((opt, index) => {
                      const selected = state.human_origin_feat_trait_options.some(
                        (entry) => entry.trait_option_id === opt.trait_option_id,
                      );
                      return (
                        <ChipToggle
                          key={opt.trait_option_id}
                          label={opt.name}
                          selected={selected}
                          disabled={
                            !selected &&
                            state.human_origin_feat_trait_options.filter(
                              (entry) =>
                                entry.trait_id === group.trait_id &&
                                entry.option_group === group.option_group,
                            ).length >= group.choice_count
                          }
                          onInfo={
                            opt.description
                              ? () =>
                                  setModalFeat({
                                    title: opt.name,
                                    content: "trait",
                                    traitOption: opt,
                                  })
                              : undefined
                          }
                          onToggle={() =>
                            onChange(
                              toggleHumanOriginFeatTraitOption(
                                state,
                                data,
                                {
                                  trait_id: group.trait_id,
                                  option_group: group.option_group,
                                  selection_key: selectionKey(
                                    group.option_group,
                                    index,
                                  ),
                                  trait_option_id: opt.trait_option_id,
                                },
                                group.choice_count,
                              ),
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}

              {lockedOriginFeat ? (
                <section>
                  <p className="text-xs font-medium text-foreground">
                    {background.origin_feat_name}: {lockedOriginFeat.trait_name}
                  </p>
                  <p className="text-xs text-muted">
                    Definido pelo antecedente {background.name}.
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <ChipToggle
                      label={lockedOriginFeat.option_name}
                      selected
                      disabled
                      onToggle={() => {}}
                    />
                  </div>
                </section>
              ) : null}

              {visibleOriginFeatChoices.map((group) => (
                <section key={`${group.trait_id}-${group.option_group}`}>
                  <p className="text-xs font-medium text-foreground">
                    {background.origin_feat_name}: {group.trait_name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {visibleTraitOptions(
                      group.options,
                      group,
                      data,
                      state,
                      mergeOriginFeatTraitOptions(
                        background,
                        state.origin_feat_trait_options,
                      ),
                    ).map((opt, index) => {
                      const originFeatOptions = mergeOriginFeatTraitOptions(
                        background,
                        state.origin_feat_trait_options,
                      );
                      const selected = originFeatOptions.some(
                        (entry) => entry.trait_option_id === opt.trait_option_id,
                      );
                      return (
                        <ChipToggle
                          key={opt.trait_option_id}
                          label={opt.name}
                          selected={selected}
                          disabled={
                            !selected &&
                            originFeatOptions.filter(
                              (entry) =>
                                entry.trait_id === group.trait_id &&
                                entry.option_group === group.option_group,
                            ).length >= group.choice_count
                          }
                          onInfo={
                            opt.description
                              ? () =>
                                  setModalFeat({
                                    title: opt.name,
                                    content: "trait",
                                    traitOption: opt,
                                  })
                              : undefined
                          }
                          onToggle={() =>
                            onChange(
                              toggleOriginFeatTraitOption(
                                state,
                                data,
                                {
                                  trait_id: group.trait_id,
                                  option_group: group.option_group,
                                  selection_key: selectionKey(
                                    group.option_group,
                                    index,
                                  ),
                                  trait_option_id: opt.trait_option_id,
                                },
                                group.choice_count,
                              ),
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {resolvedTab === "gear" ? (
            <section>
              {background.equipment_options.length === 0 ? (
                <p className="text-sm text-muted">
                  Nenhuma opção de equipamento cadastrada.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {background.equipment_options.map((opt) => {
                    const itemList = opt.items
                      .map((i) => `${i.quantity}× ${i.item_name}`)
                      .join(", ");
                    const description =
                      itemList ||
                      (opt.gp_amount
                        ? `${opt.gp_amount} PO para comprar equipamento`
                        : null) ||
                      opt.notes ||
                      undefined;

                    return (
                      <SelectionCard
                        key={opt.option_key}
                        compact
                        title={
                          opt.label ??
                          (opt.option_key === "A"
                            ? "Opção A — itens"
                            : opt.option_key === "B"
                              ? "Opção B — ouro"
                              : opt.option_key)
                        }
                        description={description}
                        selected={state.equipment_option_key === opt.option_key}
                        onSelect={() =>
                          onChange({
                            ...state,
                            equipment_option_key: opt.option_key,
                          })
                        }
                        facts={
                          opt.gp_amount
                            ? [{ label: "Ouro", value: `${opt.gp_amount} PO` }]
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modalFeat !== null}
        title={modalFeat?.title ?? ""}
        onClose={() => setModalFeat(null)}
      >
        {modalFeat?.content === "trait" && modalFeat.traitOption ? (
          <TraitOptionDetailContent option={modalFeat.traitOption} />
        ) : null}
        {modalFeat?.content === "origin" && modalFeat.featId ? (
          <OriginFeatDetailContent
            feat={
              data.origin_feats.find((f) => f.id === modalFeat.featId) ?? {
                id: modalFeat.featId,
                name: modalFeat.title,
                description: null,
                is_repeatable: false,
                origin_feat_choices: [],
                spellcasting: null,
              }
            }
          />
        ) : null}
      </BuilderDetailModal>
    </>
  );
}
