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
import { CharacterFeatsSection } from "@/features/character-sheet/components/sheet/CharacterFeatsSection";
import { CharacterTraitOptionsSection } from "@/features/character-sheet/components/sheet/CharacterTraitOptionsSection";
import { CharacterTraitsSection } from "@/features/character-sheet/components/sheet/CharacterTraitsSection";
import {
  fullCharacterDetailFixture,
  wizardCharacterFixture,
} from "@/features/character-sheet/test-fixtures/character-detail.fixture";

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
      renderToStaticMarkup(
        createElement(CharacterFeatsSection, {
          characterId: character.id,
          feats: character.character_feats,
        }),
      ),
      renderToStaticMarkup(
        createElement(CharacterTraitOptionsSection, {
          options: character.trait_options,
        }),
      ),
      renderToStaticMarkup(
        createElement(CharacterTraitsSection, {
          characterId: character.id,
          traits: character.traits,
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
    expect(html).toContain("Feats");
    expect(html).toContain("Escolhas de traço");
    expect(html).toContain("Traços e features");
    expect(html).toContain("Resistência a Fire");
    expect(html).toContain("Choose one skill proficiency.");
    expect(html).not.toContain("choice_count");
    expect(html).not.toContain("Em breve");
  });

  it("renderiza seções de magias agrupadas para Mago", () => {
    const wizard = wizardCharacterFixture();
    const html = renderToStaticMarkup(
      createElement(CharacterSpellsSection, { character: wizard }),
    );

    expect(html).toContain("Truques");
    expect(html).toContain("Preparadas");
    expect(html).toContain("Grimório");
    expect(html).toContain("2/5 preparadas");
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
