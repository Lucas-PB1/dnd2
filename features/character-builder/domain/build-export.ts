import { createInitialBuilderState } from "@/features/character-builder/domain/state/state";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

export const BUILD_EXPORT_VERSION = 1 as const;

export type BuilderExportDocument = {
  version: typeof BUILD_EXPORT_VERSION;
  exported_at: string;
  state: CharacterBuilderState;
};

export function exportBuilderState(
  state: CharacterBuilderState,
): BuilderExportDocument {
  return {
    version: BUILD_EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    state: structuredClone(state),
  };
}

export function serializeBuilderExport(state: CharacterBuilderState): string {
  return JSON.stringify(exportBuilderState(state), null, 2);
}

export function parseBuilderExport(raw: string): BuilderExportDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("JSON inválido.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("version" in parsed) ||
    !("state" in parsed)
  ) {
    throw new Error("Formato de build não reconhecido.");
  }

  const doc = parsed as BuilderExportDocument;

  if (doc.version !== BUILD_EXPORT_VERSION) {
    throw new Error(`Versão ${doc.version} não suportada (esperado ${BUILD_EXPORT_VERSION}).`);
  }

  if (typeof doc.state !== "object" || doc.state === null) {
    throw new Error("Estado do builder ausente.");
  }

  return doc;
}

export function importBuilderState(raw: string): CharacterBuilderState {
  const doc = parseBuilderExport(raw);
  return {
    ...createInitialBuilderState(),
    ...doc.state,
    shop_purchases: doc.state.shop_purchases ?? [],
    secondary_class: doc.state.secondary_class ?? null,
  };
}
