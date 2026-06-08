"use client";

import { useState } from "react";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  SelectionOptionCard,
  type SelectionFact,
} from "@/features/character-builder/components/shared/BuilderParts";
import { BuilderDetailModal } from "@/features/character-builder/components/shared/BuilderDetailModal";
import { ClassDetailContent } from "@/features/character-builder/components/shared/builder-detail-content";
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
};

function totalClassSkillChoices(cls: BuilderClassEntry): number {
  return cls.skill_choices.reduce((sum, group) => sum + group.choice_count, 0);
}

function classSelectionFacts(cls: BuilderClassEntry): SelectionFact[] {
  const expertiseAtCreation = totalExpertiseChoicesRequired(
    cls.expertise_choices ?? [],
  );
  const spellCount = classRequiresSpellSelection(cls.spellcasting)
    ? totalSpellChoicesRequired(cls.spellcasting)
    : null;

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
  ];
}

export function StepClass({ data, state, onChange }: StepClassProps) {
  const [modalClass, setModalClass] = useState<BuilderClassEntry | null>(null);

  return (
    <>
      <BuilderStepFrame
        title="Classe"
        hint="Nível 1 — perícias e proficiências fixas são aplicadas automaticamente."
      >
        <div className="grid auto-rows-fr gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.classes.map((cls) => (
            <SelectionOptionCard
              key={cls.id}
              compact
              fillHeight
              factsColumns={2}
              title={cls.name}
              description={`Dado de vida ${cls.hit_die}`}
              selected={state.class_id === cls.id}
              facts={classSelectionFacts(cls)}
              onInfo={() => setModalClass(cls)}
              onSelect={() =>
                onChange(resetDependentState({ ...state, class_id: cls.id }, 3))
              }
            />
          ))}
        </div>
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modalClass !== null}
        title={modalClass?.name ?? ""}
        onClose={() => setModalClass(null)}
      >
        {modalClass ? <ClassDetailContent cls={modalClass} /> : null}
      </BuilderDetailModal>
    </>
  );
}
