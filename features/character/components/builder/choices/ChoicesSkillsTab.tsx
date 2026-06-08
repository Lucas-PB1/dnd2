import { ChipToggle } from "@/features/character/components/builder/BuilderParts";
import type { BuilderClassEntry } from "@/features/character/types/builder.types";
import {
  getExpertiseSelectionsForTrait,
  setClassTool,
  toggleClassSkill,
  toggleExpertiseSkill,
} from "@/features/character/hooks/useCharacterBuilder";
import { eligibleSkillsForExpertiseGroup } from "@/lib/character/class-expertise";
import {
  skillIdsGrantedOutsideClass,
  visibleWhenTaken,
} from "@/lib/character/builder-selection";
import type { ChoicesTabProps } from "./types";

type ChoicesSkillsTabProps = ChoicesTabProps & {
  cls: BuilderClassEntry;
};

export function ChoicesSkillsTab({
  data,
  state,
  onChange,
  cls,
}: ChoicesSkillsTabProps) {
  const skillGroups = cls.skill_choices;
  const maxSkills = skillGroups.reduce((s, g) => s + g.choice_count, 0);
  const allExpertiseSelected = cls.expertise_choices.flatMap((group) =>
    getExpertiseSelectionsForTrait(state, group.trait_id),
  );
  const classToolIds = state.class_tool_selections
    .map((tool) => tool.tool_id)
    .filter((id): id is number => id !== null);

  return (
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
        const selected = getExpertiseSelectionsForTrait(state, group.trait_id);
        const eligible = eligibleSkillsForExpertiseGroup(data, state, group);

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
                Selecione as perícias de classe antes de escolher expertise.
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
              entry.source_type === "class" && entry.source_id === cls.id,
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
  );
}
