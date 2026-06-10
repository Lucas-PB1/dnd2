import { ApiError } from "@/lib/api/errors";
import type {
  BuilderClassFeature,
  BuilderSubclassSummary,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";
import { one } from "./class-mappers";

type TraitRow = {
  id: number;
  name: string;
  description: string | null;
};

type ClassTraitRow = {
  class_id: number;
  trait_id: number;
  level_required: number;
  traits: TraitRow | TraitRow[] | null;
};

type SubclassTraitRow = {
  subclass_id: number;
  trait_id: number;
  level_required: number;
  traits: TraitRow | TraitRow[] | null;
};

type SubclassRow = {
  class_id: number;
  id: number;
  name: string;
  description: string | null;
  unlock_level: number | null;
};

function mapClassFeature(row: ClassTraitRow): BuilderClassFeature | null {
  const trait = one(row.traits);
  if (!trait) return null;

  return {
    trait_id: row.trait_id,
    name: trait.name,
    description: trait.description,
    level_required: row.level_required,
  };
}

function mapSubclassFeature(row: SubclassTraitRow): BuilderClassFeature | null {
  const trait = one(row.traits);
  if (!trait) return null;

  return {
    trait_id: row.trait_id,
    name: trait.name,
    description: trait.description,
    level_required: row.level_required,
  };
}

export async function fetchClassFeatures(
  admin: BuilderAdminClient,
  classId: number,
): Promise<BuilderClassFeature[]> {
  const { data, error } = await admin
    .from("class_traits")
    .select("class_id, trait_id, level_required, traits(id, name, description)")
    .eq("class_id", classId)
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  return ((data ?? []) as ClassTraitRow[])
    .map(mapClassFeature)
    .filter((feature): feature is BuilderClassFeature => feature !== null);
}

export async function fetchAllClassFeatures(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderClassFeature[]>> {
  const { data, error } = await admin
    .from("class_traits")
    .select("class_id, trait_id, level_required, traits(id, name, description)")
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  const featuresByClass = new Map<number, BuilderClassFeature[]>();

  for (const row of (data ?? []) as ClassTraitRow[]) {
    const feature = mapClassFeature(row);
    if (!feature) continue;
    const list = featuresByClass.get(row.class_id) ?? [];
    list.push(feature);
    featuresByClass.set(row.class_id, list);
  }

  return featuresByClass;
}

async function fetchSubclassFeatures(
  admin: BuilderAdminClient,
  subclassIds: number[],
): Promise<Map<number, BuilderClassFeature[]>> {
  if (subclassIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("subclass_traits")
    .select("subclass_id, trait_id, level_required, traits(id, name, description)")
    .in("subclass_id", subclassIds)
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  return mapSubclassFeatures(data ?? []);
}

async function fetchAllSubclassFeatures(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderClassFeature[]>> {
  const { data, error } = await admin
    .from("subclass_traits")
    .select("subclass_id, trait_id, level_required, traits(id, name, description)")
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  return mapSubclassFeatures(data ?? []);
}

function mapSubclassFeatures(rows: unknown[]): Map<number, BuilderClassFeature[]> {
  const featuresBySubclass = new Map<number, BuilderClassFeature[]>();

  for (const row of rows as SubclassTraitRow[]) {
    const feature = mapSubclassFeature(row);
    if (!feature) continue;
    const list = featuresBySubclass.get(row.subclass_id) ?? [];
    list.push(feature);
    featuresBySubclass.set(row.subclass_id, list);
  }

  return featuresBySubclass;
}

export async function fetchClassSubclasses(
  admin: BuilderAdminClient,
  classId: number,
): Promise<BuilderSubclassSummary[]> {
  const { data, error } = await admin
    .from("subclasses")
    .select("class_id, id, name, description, unlock_level")
    .eq("class_id", classId)
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const rows = (data ?? []) as SubclassRow[];
  const featuresBySubclass = await fetchSubclassFeatures(
    admin,
    rows.map((row) => row.id),
  );

  return rows.map(({ id, name, description, unlock_level }) => ({
    id,
    name,
    description,
    unlock_level: unlock_level ?? 3,
    features: featuresBySubclass.get(id) ?? [],
  }));
}

export async function fetchAllClassSubclasses(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderSubclassSummary[]>> {
  const [{ data, error }, featuresBySubclass] = await Promise.all([
    admin
      .from("subclasses")
      .select("class_id, id, name, description, unlock_level")
      .order("name"),
    fetchAllSubclassFeatures(admin),
  ]);

  if (error) throw new ApiError(error.message, 400);

  const subclassesByClass = new Map<number, BuilderSubclassSummary[]>();

  for (const row of (data ?? []) as SubclassRow[]) {
    const list = subclassesByClass.get(row.class_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      description: row.description,
      unlock_level: row.unlock_level ?? 3,
      features: featuresBySubclass.get(row.id) ?? [],
    });
    subclassesByClass.set(row.class_id, list);
  }

  return subclassesByClass;
}
