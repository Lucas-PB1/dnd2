import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CharacterAbilitiesSection } from "@/features/character-sheet/components/sheet/CharacterAbilitiesSection";
import { CharacterCombatSection } from "@/features/character-sheet/components/sheet/CharacterCombatSection";
import { CharacterEffectsSection } from "@/features/character-sheet/components/sheet/CharacterEffectsSection";
import { CharacterInventorySection } from "@/features/character-sheet/components/sheet/CharacterInventorySection";
import { CharacterProficienciesSection } from "@/features/character-sheet/components/sheet/CharacterProficienciesSection";
import { CharacterSpellsSection } from "@/features/character-sheet/components/sheet/CharacterSpellsSection";
import { CharacterVitalsSection } from "@/features/character-sheet/components/sheet/CharacterVitalsSection";
import { fullCharacterDetailFixture } from "@/features/character-sheet/test-fixtures/character-detail.fixture";

vi.mock("@/components/motion", () => ({
  FadeIn: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

describe("character sheet smoke", () => {
  const character = fullCharacterDetailFixture({
    known_spells: [
      {
        spell_id: 9,
        name: "Shield",
        level: 1,
        school: "Abjuration",
        casting_time: "1 reaction",
        range_text: "Self",
        components: "V,S",
        material_component: null,
        duration_text: "1 round",
        requires_concentration: false,
        requires_ritual: false,
        save_attribute: null,
        attack_type: null,
        source_type: "class",
        is_prepared: true,
        always_prepared: false,
      },
    ],
  });

  it("renderiza seções principais da ficha com fixture completa", () => {
    const html = [
      renderToStaticMarkup(
        createElement(CharacterVitalsSection, { character }),
      ),
      renderToStaticMarkup(
        createElement(CharacterAbilitiesSection, { character }),
      ),
      renderToStaticMarkup(
        createElement(CharacterCombatSection, { character }),
      ),
      renderToStaticMarkup(
        createElement(CharacterSpellsSection, { character }),
      ),
      renderToStaticMarkup(
        createElement(CharacterInventorySection, { inventory: character.inventory }),
      ),
      renderToStaticMarkup(
        createElement(CharacterProficienciesSection, { character }),
      ),
      renderToStaticMarkup(
        createElement(CharacterEffectsSection, {
          effects: character.active_effects,
          modifiers: character.stat_modifiers,
        }),
      ),
    ].join("\n");

    expect(html).toContain("Combate");
    expect(html).toContain("Atributos");
    expect(html).toContain("Ataques");
    expect(html).toContain("Magias");
    expect(html).toContain("Inventário");
    expect(html).toContain("Proficiências");
    expect(html).toContain("Efeitos ativos");
    expect(html).not.toContain("Em breve");
  });
});

describe("CharacterSheetView smoke", () => {
  it("não exibe placeholder Em breve", async () => {
    const { CharacterSheetView } = await import(
      "@/features/character-sheet/components/sheet/CharacterSheetView"
    );

    const html = renderToStaticMarkup(
      createElement(CharacterSheetView, {
        character: fullCharacterDetailFixture({
          is_owner: false,
          known_spells: [
            {
              spell_id: 9,
              name: "Shield",
              level: 1,
              school: "Abjuration",
              casting_time: "1 reaction",
              range_text: "Self",
              components: "V,S",
              material_component: null,
              duration_text: "1 round",
              requires_concentration: false,
              requires_ritual: false,
              save_attribute: null,
              attack_type: null,
              source_type: "class",
              is_prepared: true,
              always_prepared: false,
            },
          ],
        }),
      }),
    );

    expect(html).toContain("Atributos");
    expect(html).toContain("Inventário");
    expect(html).not.toContain("Em breve");
  });
});
