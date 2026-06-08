import { describe, expect, it } from "vitest";
import {
  expectedResourceMaxUses,
  POST_CREATION_RESOURCE_CHECKS,
} from "@/features/character-builder/domain/post-creation/expected-resources";

describe("expectedResourceMaxUses — sync_character_resources", () => {
  it.each(POST_CREATION_RESOURCE_CHECKS)(
    "$label → $resourceKey @ nível $classLevel",
    ({ resourceKey, classLevel }) => {
      expect(expectedResourceMaxUses(resourceKey, classLevel)).toBeGreaterThan(0);
    },
  );

  it("Rage @ 3 = 3 usos", () => {
    expect(expectedResourceMaxUses("feature-barbarian-rage", 3)).toBe(3);
  });

  it("Second Wind @ 5 = 3 usos", () => {
    expect(expectedResourceMaxUses("feature-fighter-second-wind", 5)).toBe(3);
  });

  it("Channel Divinity (Cleric) @ 5 = 2 usos", () => {
    expect(expectedResourceMaxUses("feature-cleric-channel-divinity", 5)).toBe(2);
  });

  it("Channel Divinity (Paladin) @ 5 = 2 usos", () => {
    expect(expectedResourceMaxUses("feature-paladin-channel-divinity", 5)).toBe(2);
  });

  it("Focus Points @ 5 = 5", () => {
    expect(expectedResourceMaxUses("feature-monk-focus-points", 5)).toBe(5);
  });
});
