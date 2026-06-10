import { ApiError } from "@/lib/api/errors";
import type { BuilderSkillChoiceGroup } from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";

export async function fetchAllClassSkillChoiceGroups(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderSkillChoiceGroup[]>> {
  const { data, error } = await admin
    .from("class_skill_choice_groups")
    .select("class_id, choice_group, choice_count, notes")
    .order("class_id");

  if (error) throw new ApiError(error.message, 400);

  const groupsByClass = new Map<number, BuilderSkillChoiceGroup[]>();

  for (const row of data ?? []) {
    const list = groupsByClass.get(row.class_id) ?? [];
    list.push({
      choice_group: row.choice_group,
      choice_count: row.choice_count,
      notes: row.notes,
      options: [],
    });
    groupsByClass.set(row.class_id, list);
  }

  return groupsByClass;
}
