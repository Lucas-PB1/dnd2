import type {
  CharacterCatalog,
  CharacterDetail,
  CharacterListResponse,
  CharacterSummary,
  CreateCharacterPayload,
  CreateCharacterResponse,
} from "@/features/character/types/character.types";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
  CharacterBuilderSummary,
} from "@/features/character/types/builder.types";
import { mergeBuilderData } from "@/lib/character/builder-merge";

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: string }).error === "string"
        ? (data as { error: string }).error
        : "Ocorreu um erro. Tente novamente.";
    throw new Error(message);
  }
  return data as T;
}

const fetchOptions: RequestInit = { credentials: "include" };

export async function fetchCharacters(): Promise<CharacterSummary[]> {
  const response = await fetch("/api/characters", fetchOptions);
  const data = await parseResponse<CharacterListResponse>(response);
  return data.characters;
}

export async function fetchCharacter(id: number): Promise<CharacterDetail> {
  const response = await fetch(`/api/characters/${id}`, fetchOptions);
  const data = await parseResponse<{ character: CharacterDetail }>(response);
  return data.character;
}

export async function fetchCharacterCatalog(): Promise<CharacterCatalog> {
  const response = await fetch("/api/characters/catalog", fetchOptions);
  return parseResponse<CharacterCatalog>(response);
}

export async function fetchCharacterBuilderSummary(): Promise<CharacterBuilderSummary> {
  const response = await fetch(
    "/api/characters/builder-data?scope=summary",
    fetchOptions,
  );
  return parseResponse<CharacterBuilderSummary>(response);
}

export async function fetchCharacterBuilderDetails(request: {
  class_id: number;
  species_id: number;
  background_id: number;
}): Promise<Partial<CharacterBuilderData>> {
  const params = new URLSearchParams({
    scope: "details",
    class_id: String(request.class_id),
    species_id: String(request.species_id),
    background_id: String(request.background_id),
  });
  const response = await fetch(
    `/api/characters/builder-data?${params.toString()}`,
    fetchOptions,
  );
  return parseResponse<Partial<CharacterBuilderData>>(response);
}

export function mergeBuilderCatalog(
  summary: CharacterBuilderSummary,
  details: Partial<CharacterBuilderData> | null,
): CharacterBuilderData {
  return mergeBuilderData(summary, details);
}

/** @deprecated Use fetchCharacterBuilderSummary */
export async function fetchCharacterBuilderData(): Promise<CharacterBuilderData> {
  const summary = await fetchCharacterBuilderSummary();
  return mergeBuilderCatalog(summary, null);
}

export async function createCharacter(
  payload: CreateCharacterPayload,
): Promise<CreateCharacterResponse> {
  const response = await fetch("/api/characters", {
    ...fetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<CreateCharacterResponse>(response);
}

export async function createCharacterFromBuilder(
  state: CharacterBuilderState,
): Promise<CreateCharacterResponse> {
  const response = await fetch("/api/characters", {
    ...fetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  return parseResponse<CreateCharacterResponse>(response);
}

export async function deleteCharacter(characterId: number): Promise<void> {
  const response = await fetch(`/api/characters/${characterId}`, {
    ...fetchOptions,
    method: "DELETE",
  });
  await parseResponse<{ ok: boolean }>(response);
}
