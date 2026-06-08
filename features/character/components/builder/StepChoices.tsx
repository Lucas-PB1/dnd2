"use client";

import { useState } from "react";
import {
  BuilderSectionTabs,
  BuilderStepFrame,
} from "@/features/character/components/builder/BuilderParts";
import { BuilderDetailModal } from "@/features/character/components/builder/BuilderDetailModal";
import {
  OriginFeatDetailContent,
  TraitOptionDetailContent,
} from "@/features/character/components/builder/builder-detail-content";
import type {
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character/types/builder.types";
import { ChoicesFeatsTab } from "./choices/ChoicesFeatsTab";
import { ChoicesGearTab } from "./choices/ChoicesGearTab";
import { ChoicesSkillsTab } from "./choices/ChoicesSkillsTab";
import { ChoicesSpellsTab } from "./choices/ChoicesSpellsTab";
import { ChoicesTraitsTab } from "./choices/ChoicesTraitsTab";
import type { ChoiceTab, FeatModalState } from "./choices/types";
import { useChoiceTabs } from "./choices/useChoiceTabs";

type StepChoicesProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

export function StepChoices({ data, state, onChange }: StepChoicesProps) {
  const [activeTab, setActiveTab] = useState<ChoiceTab>("skills");
  const [cantripFilter, setCantripFilter] = useState("");
  const [spellbookFilter, setSpellbookFilter] = useState("");
  const [preparedFilter, setPreparedFilter] = useState("");
  const [featSpellFilter, setFeatSpellFilter] = useState("");
  const [modalFeat, setModalFeat] = useState<FeatModalState>(null);

  const cls = data.classes.find((c) => c.id === state.class_id);
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );

  const tabs = useChoiceTabs({ cls, species, background, humanFeat, state });
  const resolvedTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "skills");

  const classToolIds = state.class_tool_selections
    .map((tool) => tool.tool_id)
    .filter((id): id is number => id !== null);

  if (!cls || !species || !background) {
    return (
      <BuilderStepFrame title="Escolhas">
        <p className="text-sm text-muted">
          Complete os passos anteriores antes de fazer escolhas.
        </p>
      </BuilderStepFrame>
    );
  }

  const openTraitOptionInfo = (option: BuilderTraitOption) => {
    setModalFeat({
      title: option.name,
      content: "trait",
      traitOption: option,
    });
  };

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
            <ChoicesSkillsTab
              data={data}
              state={state}
              onChange={onChange}
              cls={cls}
            />
          ) : null}

          {resolvedTab === "spells" ? (
            <ChoicesSpellsTab
              data={data}
              state={state}
              onChange={onChange}
              cls={cls}
              background={background}
              humanFeat={humanFeat}
              cantripFilter={cantripFilter}
              spellbookFilter={spellbookFilter}
              preparedFilter={preparedFilter}
              featSpellFilter={featSpellFilter}
              onCantripFilterChange={setCantripFilter}
              onSpellbookFilterChange={setSpellbookFilter}
              onPreparedFilterChange={setPreparedFilter}
              onFeatSpellFilterChange={setFeatSpellFilter}
            />
          ) : null}

          {resolvedTab === "traits" ? (
            <ChoicesTraitsTab
              data={data}
              state={state}
              onChange={onChange}
              species={species}
              background={background}
              classToolIds={classToolIds}
              onOptionInfo={openTraitOptionInfo}
            />
          ) : null}

          {resolvedTab === "feats" ? (
            <ChoicesFeatsTab
              data={data}
              state={state}
              onChange={onChange}
              species={species}
              background={background}
              humanFeat={humanFeat}
              onOptionInfo={openTraitOptionInfo}
              onOriginFeatInfo={(featId, title) =>
                setModalFeat({ title, content: "origin", featId })
              }
            />
          ) : null}

          {resolvedTab === "gear" ? (
            <ChoicesGearTab
              data={data}
              state={state}
              onChange={onChange}
              background={background}
            />
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
