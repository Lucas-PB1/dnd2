"use client";

import { useState } from "react";
import {
  BuilderSectionTabs,
  BuilderStepFrame,
} from "@/features/character-builder/components/shared/BuilderParts";
import { BuilderDetailModal } from "@/features/character-builder/components/shared/BuilderDetailModal";
import {
  OriginFeatDetailContent,
  TraitOptionDetailContent,
} from "@/features/character-builder/components/shared/builder-detail-content";
import { requiresFeatStepContent } from "@/features/character-builder/domain/feats/feat-step";
import type {
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import { ChoicesProgressionFeatsSection } from "./choices/ChoicesProgressionFeatsSection";
import { ChoicesOriginFeatsSection } from "./feats/ChoicesOriginFeatsSection";
import type { FeatTab } from "./feats/useFeatTabs";
import { useFeatTabs } from "./feats/useFeatTabs";

type StepFeatsProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

type FeatModalState = {
  title: string;
  content: "origin" | "trait";
  traitOption?: BuilderTraitOption;
  featId?: number;
} | null;

export function StepFeats({ data, state, onChange }: StepFeatsProps) {
  const [activeTab, setActiveTab] = useState<FeatTab>("origin");
  const [modal, setModal] = useState<FeatModalState>(null);

  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );

  if (!species || !background) {
    return (
      <BuilderStepFrame title="Talentos">
        <p className="text-sm text-muted">
          Complete os passos anteriores antes de escolher talentos.
        </p>
      </BuilderStepFrame>
    );
  }

  if (!requiresFeatStepContent(data, state)) {
    return (
      <BuilderStepFrame
        title="Talentos"
        hint="Nenhuma escolha de feat ou ASI é necessária para este personagem."
      >
        <p className="text-sm text-muted">
          Você pode continuar para os detalhes finais.
        </p>
      </BuilderStepFrame>
    );
  }

  const tabs = useFeatTabs({ data, state, species, background });
  const resolvedTab = tabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "origin");

  const openTraitOptionInfo = (option: BuilderTraitOption) => {
    setModal({
      title: option.name,
      content: "trait",
      traitOption: option,
    });
  };

  return (
    <>
      <BuilderStepFrame
        title="Talentos"
        hint="Feats de origem, Versátil (humano) e escolhas de ASI ou feat nos níveis de progressão."
      >
        {tabs.length > 1 ? (
          <BuilderSectionTabs
            tabs={tabs}
            activeId={resolvedTab}
            onChange={(id) => setActiveTab(id as FeatTab)}
          />
        ) : null}

        <div className={tabs.length > 1 ? "mt-3 min-h-0 flex-1 overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto"}>
          {resolvedTab === "origin" ? (
            <ChoicesOriginFeatsSection
              data={data}
              state={state}
              onChange={onChange}
              species={species}
              background={background}
              humanFeat={humanFeat}
              onOptionInfo={openTraitOptionInfo}
              onOriginFeatInfo={(featId, title) =>
                setModal({ title, content: "origin", featId })
              }
            />
          ) : null}

          {resolvedTab === "progression" ? (
            <ChoicesProgressionFeatsSection
              data={data}
              state={state}
              onChange={onChange}
              onOptionInfo={openTraitOptionInfo}
            />
          ) : null}
        </div>
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modal !== null}
        title={modal?.title ?? ""}
        onClose={() => setModal(null)}
      >
        {modal?.content === "trait" && modal.traitOption ? (
          <TraitOptionDetailContent option={modal.traitOption} />
        ) : null}
        {modal?.content === "origin" && modal.featId ? (
          <OriginFeatDetailContent
            feat={
              data.origin_feats.find((f) => f.id === modal.featId) ?? {
                id: modal.featId,
                name: modal.title,
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
