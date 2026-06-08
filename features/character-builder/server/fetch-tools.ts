import { ApiError } from "@/lib/api/errors";
import type { BuilderToolOption } from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";

export async function fetchToolsByCategory(admin: BuilderAdminClient) {
  const { data: tools, error } = await admin
    .from("tools")
    .select("id, name, category")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const tools_by_category: Record<string, BuilderToolOption[]> = {};
  for (const tool of tools ?? []) {
    const category = tool.category ?? "Outros";
    const list = tools_by_category[category] ?? [];
    list.push({
      tool_id: tool.id,
      name: tool.name,
      category: tool.category,
    });
    tools_by_category[category] = list;
  }
  return tools_by_category;
}
