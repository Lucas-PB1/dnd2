"use client";

import { useState } from "react";
import {
  BuilderStepFrame,
  ChipToggle,
  SelectionOptionCard,
} from "@/features/character-builder/components/shared/BuilderParts";
import { BuilderDetailModal } from "@/features/character-builder/components/shared/BuilderDetailModal";
import { SpeciesDetailContent } from "@/features/character-builder/components/shared/builder-detail-content";
import type {
  BuilderSpeciesEntry,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import { resetDependentState } from "@/features/character-builder/hooks/useCharacterBuilder";
import { parseSizeOptions } from "@/features/character-builder/domain/abilities/abilities";

type StepSpeciesProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
};

export function StepSpecies({ data, state, onChange }: StepSpeciesProps) {
  const [modalSpecies, setModalSpecies] = useState<BuilderSpeciesEntry | null>(
    null,
  );

  const species = data.species.find((s) => s.id === state.species_id);
  const sizes = species ? parseSizeOptions(species.size_options) : [];

  return (
    <>
      <BuilderStepFrame
        title="Espécie"
        hint="Escolha a raça do personagem. Toque em ⓘ para ver detalhes completos."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {data.species.map((entry) => (
            <SelectionOptionCard
              key={entry.id}
              compact
              title={entry.name}
              description={entry.description}
              selected={state.species_id === entry.id}
              facts={[
                { label: "Tipo", value: entry.creature_type },
                { label: "Desl.", value: `${entry.base_speed} pés` },
              ]}
              onInfo={() => setModalSpecies(entry)}
              onSelect={() =>
                onChange(
                  resetDependentState(
                    {
                      ...state,
                      species_id: entry.id,
                      size:
                        parseSizeOptions(entry.size_options).length === 1
                          ? parseSizeOptions(entry.size_options)[0]
                          : null,
                    },
                    1,
                  ),
                )
              }
            />
          ))}
        </div>

        {sizes.length > 1 ? (
          <footer className="mt-4 shrink-0 border-t border-border pt-4">
            <p className="text-sm font-medium text-muted">Tamanho</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <ChipToggle
                  key={size}
                  label={size}
                  selected={state.size === size}
                  onToggle={() => onChange({ size })}
                />
              ))}
            </div>
          </footer>
        ) : null}
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modalSpecies !== null}
        title={modalSpecies?.name ?? ""}
        onClose={() => setModalSpecies(null)}
      >
        {modalSpecies ? <SpeciesDetailContent species={modalSpecies} /> : null}
      </BuilderDetailModal>
    </>
  );
}
