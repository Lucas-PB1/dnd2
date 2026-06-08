import type {
  BuilderClassEntry,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import { toggleOptionalFeatureOption } from "@/features/character-builder/domain/optional-features";
import type { ChoicesTabProps } from "./types";
import { TraitOptionGroupSection } from "./TraitOptionGroupSection";

type ChoicesOptionalTabProps = ChoicesTabProps & {
  cls: BuilderClassEntry;
  onOptionInfo: (option: BuilderTraitOption) => void;
};

export function ChoicesOptionalTab({
  data,
  state,
  onChange,
  cls,
  onOptionInfo,
}: ChoicesOptionalTabProps) {
  const groups = cls.optional_feature_groups ?? [];

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nenhuma escolha opcional de classe para este nível.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <TraitOptionGroupSection
          key={group.group_key}
          sectionKey={group.group_key}
          title={group.trait_name}
          traitDescription={group.trait_description}
          group={{
            trait_id: group.trait_id,
            option_group: group.option_group,
            choice_count: group.choice_count,
            notes: group.notes,
            options: group.options,
          }}
          selections={state.class_trait_option_selections}
          data={data}
          state={state}
          onChange={onChange}
          onOptionInfo={onOptionInfo}
          buildNextState={(selection) =>
            toggleOptionalFeatureOption(state, group, selection)
          }
        />
      ))}
    </div>
  );
}
