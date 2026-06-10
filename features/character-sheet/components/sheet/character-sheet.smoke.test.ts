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
    expect(html).toContain("2/9 preparadas");
  });

  it("mostra ataque finesse com proficiência e maestria", () => {
    const rogue = fullCharacterDetailFixture({
      weapons: [
        {
          item_id: 10,
          name: "Rapier",
          is_equipped: true,
          attack_ability: "DEX",
          attack_ability_options: ["STR", "DEX"],
          proficient: true,
          attack_bonus: 7,
          damage_formula: "1d8+4",
          damage_type: "Piercing",
          properties: "Finesse",
          mastery_name: "Vex",
        },
      ],
    });
    const html = renderToStaticMarkup(
      createElement(CharacterCombatSection, { character: rogue }),
    );

    expect(html).toContain("Rapier");
    expect(html).toContain("Destreza");
    expect(html).toContain("Força/Destreza");
    expect(html).toContain("Prof");
    expect(html).toContain("Maestria Vex");
    expect(html).toContain("+7");
  });

  it("usa CA e deslocamento efetivos na seção de combate", () => {
    const armored = fullCharacterDetailFixture({
      sheet_summary: {
        ...fullCharacterDetailFixture().sheet_summary!,
        armor_class: 10,
        effective_armor_class: 18,
        speed: 30,
        effective_speed: 20,
        max_hp: 45,
        effective_max_hp: 55,
      },
    });
    const html = renderToStaticMarkup(
      createElement(CharacterVitalsSection, { character: armored }),
    );

    expect(html).toContain("18");
    expect(html).toContain("20 ft");
    expect(html).toContain("45/55");
    expect(html).not.toContain("30 ft");
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
