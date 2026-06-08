import type {
  CharacterDetail,
  CharacterListResponse,
  CharacterSummary,
} from "../types/character.types";

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

export async function deleteCharacter(characterId: number): Promise<void> {
  const response = await fetch(`/api/characters/${characterId}`, {
    ...fetchOptions,
    method: "DELETE",
  });
  await parseResponse<{ ok: boolean }>(response);
}
