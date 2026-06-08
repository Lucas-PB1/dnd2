import type {
  CharacterCatalog,
  CreateCharacterPayload,
  CreateCharacterResponse,
} from "@/features/character-sheet/types/character.types";

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

/** Formulário legado (catálogo + payload mínimo). Preferir o wizard. */
export async function fetchCharacterCatalog(): Promise<CharacterCatalog> {
  const response = await fetch("/api/characters/catalog", fetchOptions);
  return parseResponse<CharacterCatalog>(response);
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
