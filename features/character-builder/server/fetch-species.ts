import { ApiError } from "@/lib/api/errors";
import type {
  BuilderSpeciesTrait,
  BuilderTraitChoiceGroup,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";

export async function fetchSpeciesTraitsForSpecies(
  admin: BuilderAdminClient,
  speciesId: number,
): Promise<BuilderSpeciesTrait[]> {
  const { data: links, error } = await admin
    .from("species_traits")
    .select("species_id, trait_id, traits(id, name, description)")
    .eq("species_id", speciesId);

  if (error) throw new ApiError(error.message, 400);
  if (!links?.length) return [];

  const traitIds = links.map((link) => link.trait_id);

  const { data: groups, error: groupError } = await admin
    .from("trait_option_groups")
    .select("trait_id, option_group, choice_count, is_required, notes")
    .in("trait_id", traitIds);

  if (groupError) throw new ApiError(groupError.message, 400);

  const { data: options, error: optionError } = await admin
    .from("trait_options")
    .select(
      "id, trait_id, option_group, name, description, sort_order, skill_id",
    )
    .in("trait_id", traitIds)
    .order("sort_order");

  if (optionError) throw new ApiError(optionError.message, 400);

  return links.flatMap((link) => {
    const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
    if (!trait) return [];

    const choice_groups: BuilderTraitChoiceGroup[] = (groups ?? [])
      .filter((group) => group.trait_id === link.trait_id)
      .map((group) => ({
        trait_id: link.trait_id,
        trait_name: trait.name,
        option_group: group.option_group,
        choice_count: group.choice_count,
        is_required: group.is_required,
        notes: group.notes,
        options: (options ?? [])
          .filter(
            (opt) =>
              opt.trait_id === link.trait_id &&
              opt.option_group === group.option_group,
          )
          .map(
            (opt): BuilderTraitOption => ({
              trait_option_id: opt.id,
              name: opt.name,
              description: opt.description,
              option_group: opt.option_group,
              skill_id: opt.skill_id,
            }),
          ),
      }));

    return [
      {
        trait_id: link.trait_id,
        name: trait.name,
        description: trait.description,
        choice_groups,
      },
    ];
  });
}
