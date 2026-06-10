import type {
  CharacterClassSummary,
  CharacterSummary,
} from "@/shared/character";

type SpeciesRef = { name: string } | { name: string }[] | null;
type BackgroundRef = { name: string } | { name: string }[] | null;
type ClassRef = { name: string } | { name: string }[] | null;

type CharacterClassRow = {
  class_id: number;
  class_level: number;
  classes: ClassRef;
};

export type CharacterListRow = {
  id: number;
  name: string;
  level: number;
  proficiency_bonus: number;
  starting_gold_gp: number;
  updated_at: string;
  species: SpeciesRef;
  backgrounds: BackgroundRef;
  character_classes: CharacterClassRow[] | null;
};

function unwrapName(ref: SpeciesRef | BackgroundRef | ClassRef): string | null {
  if (ref == null) return null;
  const item = Array.isArray(ref) ? ref[0] : ref;
  return item?.name ?? null;
}

function mapClasses(rows: CharacterClassRow[] | null): CharacterClassSummary[] {
  if (!rows?.length) return [];

  return rows
    .map((row) => ({
      class_id: row.class_id ?? 0,
      name: unwrapName(row.classes) ?? "Classe",
      level: row.class_level,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function mapCharacterRow(row: CharacterListRow): CharacterSummary {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    proficiency_bonus: row.proficiency_bonus ?? 2,
    starting_gold_gp: row.starting_gold_gp ?? 0,
    species_name: unwrapName(row.species),
    background_name: unwrapName(row.backgrounds),
    classes: mapClasses(row.character_classes),
    updated_at: row.updated_at,
  };
}

export const CHARACTER_LIST_SELECT = `
  id,
  name,
  level,
  proficiency_bonus,
  starting_gold_gp,
  updated_at,
  species ( name ),
  backgrounds ( name ),
  character_classes ( class_id, class_level, classes ( name ) )
` as const;

export function buildCreateCharacterRpcPayload(payload: {
  name: string;
  species_id: number;
  background_id: number;
  class_id: number;
  class_level?: number;
  subclass_id?: number | null;
}) {
  const class_level = payload.class_level ?? 1;
  return {
    name: payload.name.trim(),
    species_id: payload.species_id,
    background_id: payload.background_id,
    classes: [{
      class_id: payload.class_id,
      class_level,
      ...(payload.subclass_id ? { subclass_id: payload.subclass_id } : {}),
    }],
  };
}

export function mapRpcError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("name is required")) {
    return "Informe o nome do personagem.";
  }
  if (normalized.includes("species_id and background_id")) {
    return "Selecione espécie e antecedente.";
  }
  if (normalized.includes("classes array is required")) {
    return "Selecione uma classe.";
  }
  if (normalized.includes("authenticated player required")) {
    return "Não autenticado.";
  }
  if (normalized.includes("unknown species_id")) {
    return "Espécie inválida.";
  }
  if (normalized.includes("unknown background_id")) {
    return "Antecedente inválido.";
  }
  if (normalized.includes("unknown class_id")) {
    return "Classe inválida.";
  }
  if (normalized.includes("player profile required")) {
    return "Perfil de jogador não encontrado. Faça login novamente.";
  }
  if (normalized.includes("row-level security")) {
    return "Não foi possível salvar o personagem (permissão negada). Tente sair e entrar de novo.";
  }
  if (normalized.includes("proficiency_type_check")) {
    return "Erro ao salvar proficiências do personagem. Tente novamente.";
  }
  if (normalized.includes("group by")) {
    return "Erro ao finalizar o personagem (slots/recursos). Tente novamente.";
  }

  return message;
}
