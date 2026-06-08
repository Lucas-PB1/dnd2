"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  SelectionOptionCard,
  type SelectionFact,
} from "@/features/character-builder/components/shared/BuilderParts";
import { BuilderDetailModal } from "@/features/character-builder/components/shared/BuilderDetailModal";
import {
  ClassDetailContent,
  SubclassDetailContent,
} from "@/features/character-builder/components/shared/builder-detail-content";
import {
  MAX_CLASS_LEVEL,
  MIN_CLASS_LEVEL,
  featChoicesRequired,
  requiresSubclass,
} from "@/features/character-builder/domain/progression/levels";
import {
  type BuilderClassEntry,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  classRequiresSpellSelection,
  resetDependentState,
  totalExpertiseChoicesRequired,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import { totalSpellChoicesRequired } from "@/features/character-builder/domain/spells/class-spells";

type StepClassProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
  onClassLevelChange?: (level: number) => void;
};

function totalClassSkillChoices(cls: BuilderClassEntry): number {
  return cls.skill_choices.reduce((sum, group) => sum + group.choice_count, 0);
}

function classSelectionFacts(
  cls: BuilderClassEntry,
  classLevel: number,
): SelectionFact[] {
  const expertiseAtCreation = totalExpertiseChoicesRequired(
    cls.expertise_choices ?? [],
  );
  const spellCount = classRequiresSpellSelection(cls.spellcasting)
    ? totalSpellChoicesRequired(cls.spellcasting)
    : null;
  const featSlots = featChoicesRequired(classLevel);

  return [
    {
      label: "Salv.",
      value:
        cls.saving_throws.map((s) => ABILITY_LABELS[s] ?? s).join(", ") || "—",
    },
    {
      label: "Perícias",
      value: String(totalClassSkillChoices(cls)),
    },
    {
      label: "Magias",
      value: spellCount !== null ? String(spellCount) : "—",
    },
    {
      label: "Expertise",
      value: expertiseAtCreation > 0 ? String(expertiseAtCreation) : "—",
    },
    {
      label: "Feats",
      value: featSlots > 0 ? String(featSlots) : "—",
    },
  ];
}

export function StepClass({
  data,
  state,
  onChange,
  onClassLevelChange,
}: StepClassProps) {
  const [modalClass, setModalClass] = useState<BuilderClassEntry | null>(null);
  const [modalSubclass, setModalSubclass] = useState<
    BuilderClassEntry["subclasses"][number] | null
  >(null);
  const selectedClass = data.classes.find((cls) => cls.id === state.class_id);
  const levelLabel =
    state.class_level === 1 ? "nível 1" : `nível ${state.class_level}`;
  const showSubclassPicker =
    selectedClass !== undefined &&
    requiresSubclass(state.class_level) &&
    selectedClass.subclasses.length > 0;

  return (
    <>
      <BuilderStepFrame
        title="Classe"
        hint={`Escolha a classe e o ${levelLabel}. Perícias e proficiências fixas são aplicadas automaticamente.`}
      >
        <div className="mb-4 max-w-xs">
          <Label htmlFor="builder-class-level">Nível inicial</Label>
          <Select
            id="builder-class-level"
            className="mt-1.5 w-full"
            value={String(state.class_level)}
            onChange={(event) => {
              const nextLevel = Number(event.target.value);
              onChange(
                resetDependentState(
                  {
                    ...state,
                    class_level: nextLevel,
                    subclass_id: requiresSubclass(nextLevel)
                      ? state.subclass_id
                      : null,
                  },
                  3,
                ),
              );
              onClassLevelChange?.(nextLevel);
            }}
          >
            {Array.from(
              { length: MAX_CLASS_LEVEL - MIN_CLASS_LEVEL + 1 },
              (_, index) => {
                const level = MIN_CLASS_LEVEL + index;
                return (
                  <option key={level} value={level}>
                    Nível {level}
                  </option>
                );
              },
            )}
          </Select>
        </div>

        <div className="grid auto-rows-fr gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.classes.map((cls) => (
            <SelectionOptionCard
              key={cls.id}
              compact
              fillHeight
              factsColumns={2}
              title={cls.name}
              description={`Dado de vida ${cls.hit_die} · Nv ${state.class_level}`}
              selected={state.class_id === cls.id}
              facts={classSelectionFacts(cls, state.class_level)}
              onInfo={() => setModalClass(cls)}
              onSelect={() =>
                onChange(
                  resetDependentState(
                    { ...state, class_id: cls.id, subclass_id: null },
                    3,
                  ),
                )
              }
            />
          ))}
        </div>

        {showSubclassPicker && selectedClass ? (
          <section className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Subclasse</p>
            <p className="mt-1 text-xs text-muted">
              Obrigatória a partir do nível 3.
            </p>
            <div className="mt-3 grid auto-rows-fr gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {selectedClass.subclasses.map((subclass) => (
                <SelectionOptionCard
                  key={subclass.id}
                  compact
                  fillHeight
                  title={subclass.name}
                  description={subclass.description ?? undefined}
                  selected={state.subclass_id === subclass.id}
                  onInfo={() => setModalSubclass(subclass)}
                  onSelect={() =>
                    onChange({
                      ...state,
                      subclass_id: subclass.id,
                      class_trait_option_selections: [],
                    })
                  }
                />
              ))}
            </div>
          </section>
        ) : null}
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modalClass !== null}
        title={modalClass?.name ?? ""}
        onClose={() => setModalClass(null)}
      >
        {modalClass ? <ClassDetailContent cls={modalClass} /> : null}
      </BuilderDetailModal>

      <BuilderDetailModal
        open={modalSubclass !== null}
        title={modalSubclass?.name ?? ""}
        onClose={() => setModalSubclass(null)}
      >
        {modalSubclass ? (
          <SubclassDetailContent subclass={modalSubclass} />
        ) : null}
      </BuilderDetailModal>
    </>
  );
}
