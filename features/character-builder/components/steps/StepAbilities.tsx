"use client";

import { BuilderStepFrame } from "@/features/character-builder/components/shared/BuilderParts";
import { AbilityBoard } from "@/features/character-builder/components/steps/abilities/AbilityBoard";
import { AbilityMethodPicker } from "@/features/character-builder/components/steps/abilities/AbilityMethodPicker";
import { PointBuyBoard } from "@/features/character-builder/components/steps/abilities/PointBuyBoard";
import { RollAbilityBoard } from "@/features/character-builder/components/steps/abilities/RollAbilityBoard";
import { RollToolbar } from "@/features/character-builder/components/steps/abilities/RollToolbar";
import { selectedRollSet } from "@/features/character-builder/hooks/useCharacterBuilder";
import { STANDARD_ARRAY } from "@/features/character-builder/types/builder.types";
import type { AbilityStepProps } from "@/features/character-builder/components/steps/abilities/types";

export function StepAbilities({ state, onChange }: AbilityStepProps) {
  const activeRollSet = selectedRollSet(state);

  return (
    <BuilderStepFrame
      title="Atributos"
      hint="Escolha o método e distribua os valores entre os seis atributos."
    >
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <AbilityMethodPicker state={state} onChange={onChange} />

        {state.ability_method === "standard" ? (
          <AbilityBoard
            state={state}
            onChange={onChange}
            pool={[...STANDARD_ARRAY]}
          />
        ) : null}

        {state.ability_method === "point_buy" ? (
          <PointBuyBoard state={state} onChange={onChange} />
        ) : null}

        {state.ability_method === "roll" ? (
          <div className="flex min-h-0 flex-col gap-3">
            <RollToolbar state={state} onChange={onChange} />
            {activeRollSet ? (
              <RollAbilityBoard
                state={state}
                onChange={onChange}
                pool={activeRollSet}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </BuilderStepFrame>
  );
}
