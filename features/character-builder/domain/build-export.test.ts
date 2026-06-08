import { describe, expect, it } from "vitest";
import {
  exportBuilderState,
  importBuilderState,
  serializeBuilderExport,
} from "@/features/character-builder/domain/build-export";
import { createInitialBuilderState } from "@/features/character-builder/domain/state/state";

describe("build export/import", () => {
  it("serializa e restaura o estado", () => {
    const state = {
      ...createInitialBuilderState(),
      name: "Aldric",
      class_id: 3,
      class_level: 5,
      secondary_class: { class_id: 4, class_level: 2, subclass_id: null },
      shop_purchases: [],
    };

    const raw = serializeBuilderExport(state);
    const restored = importBuilderState(raw);

    expect(restored.name).toBe("Aldric");
    expect(restored.class_level).toBe(5);
    expect(restored.secondary_class?.class_id).toBe(4);
    expect(exportBuilderState(state).version).toBe(1);
  });
});
