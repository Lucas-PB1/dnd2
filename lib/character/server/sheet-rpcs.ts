import { ApiError } from "@/lib/api/errors";
import {
  emptyRollContextData,
  emptySheetRpcData,
  mapRollContextResponse,
  mapSheetRpcResponse,
  type RollContextData,
  type SheetRpcData,
} from "@/lib/character/map-sheet";
import type { AuthenticatedSheetClient } from "@/lib/character/server/types";

export async function fetchCharacterSheetRpc(
  client: AuthenticatedSheetClient | undefined,
  characterId: number,
): Promise<SheetRpcData> {
  if (!client) return emptySheetRpcData();

  const { data, error } = await client.rpc("get_character_sheet", {
    p_character_id: characterId,
  });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return mapSheetRpcResponse(data);
}

export async function fetchCharacterRollContext(
  client: AuthenticatedSheetClient | undefined,
  characterId: number,
): Promise<RollContextData> {
  if (!client) return emptyRollContextData();

  const { data, error } = await client.rpc("get_character_roll_context", {
    p_character_id: characterId,
  });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return mapRollContextResponse(data);
}
