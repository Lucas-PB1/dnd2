"use client";

import { useState } from "react";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  SelectionCard,
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

export function StepClass({ data, state, onChange }: StepClassProps) {
  const [modalClass, setModalClass] = useState<BuilderClassEntry | null>(null);

  return (
    <>
      <BuilderStepFrame
        title="Classe"
        hint="Nível 1 — perícias e proficiências fixas são aplicadas automaticamente."
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.classes.map((cls) => {
            const expertiseAtCreation = totalExpertiseChoicesRequired(
              cls.expertise_choices ?? [],
            );
            const facts = [
              {
                label: "Salv.",
                value:
                  cls.saving_throws
                    .map((s) => ABILITY_LABELS[s] ?? s)
                    .join(", ") || "—",
              },
              {
                label: "Perícias",
                value: String(
                  cls.skill_choices.reduce((s, g) => s + g.choice_count, 0),
                ),
              },
            ];
            if (expertiseAtCreation > 0) {
              facts.push({
                label: "Expertise",
                value: String(expertiseAtCreation),
              });
            }
            if (classRequiresSpellSelection(cls.spellcasting)) {
              facts.push({
                label: "Magias",
                value: String(totalSpellChoicesRequired(cls.spellcasting)),
              });
            }

            return (
            <SelectionCard
              key={cls.id}
              compact
              title={cls.name}
              description={`Dado de vida ${cls.hit_die}`}
              selected={state.class_id === cls.id}
              facts={facts}
              onInfo={() => setModalClass(cls)}
              onSelect={() =>
                onChange(resetDependentState({ ...state, class_id: cls.id }, 3))
              }
            />
            );
          })}
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
