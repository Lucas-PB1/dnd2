"use client";

import { useEffect, useState } from "react";
import { ChipToggle, SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import {
  filterShopItemsForLevel,
  shopBudgetGp,
  shopRemainingGp,
  shopSpentGp,
  toggleShopPurchase,
  type ShopItemRow,
} from "@/features/character-builder/domain/equipment/equipment-shop";
import { magicItemBandLabel, magicItemsAllowedAtLevel } from "@/features/character-builder/domain/equipment/magic-items-by-level";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

type ChoicesShopSectionProps = {
  state: CharacterBuilderState;
  onChange: (state: CharacterBuilderState) => void;
};

async function fetchShopItems(level: number): Promise<ShopItemRow[]> {
  const response = await fetch(`/api/items/shop?level=${level}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { items?: ShopItemRow[] };
  return data.items ?? [];
}

export function ChoicesShopSection({ state, onChange }: ChoicesShopSectionProps) {
  const [catalog, setCatalog] = useState<{
    level: number | null;
    items: ShopItemRow[];
  }>({ level: null, items: [] });
  const totalLevel = totalCharacterLevel(state);
  const budget = shopBudgetGp(state);
  const spent = shopSpentGp(state.shop_purchases);
  const remaining = shopRemainingGp(state);
  const magicBand = magicItemBandLabel(totalLevel);

  useEffect(() => {
    let active = true;
    fetchShopItems(totalLevel)
      .then((rows) => {
        if (!active) return;
        setCatalog({
          level: totalLevel,
          items: filterShopItemsForLevel(rows, totalLevel),
        });
      });
    return () => {
      active = false;
    };
  }, [totalLevel]);

  const loading = catalog.level !== totalLevel;
  const items = loading ? [] : catalog.items;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-foreground">Orçamento da loja</p>
        <p className="mt-2 text-sm text-muted">
          Gasto:{" "}
          <span className="font-medium text-foreground">
            {spent.toLocaleString("pt-BR")} PO
          </span>{" "}
          · Restante:{" "}
          <span className="font-medium text-brand">
            {remaining.toLocaleString("pt-BR")} PO
          </span>{" "}
          · Total: {budget.toLocaleString("pt-BR")} PO
        </p>
        {magicItemsAllowedAtLevel(totalLevel) ? (
          <p className="mt-2 text-xs text-muted">
            Itens mágicos disponíveis (faixa DMG: {magicBand ?? "—"}).
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Itens mágicos liberados a partir do nível 5.
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Carregando catálogo…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Nenhum item disponível para este nível.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const selected = state.shop_purchases.some(
              (entry) => entry.item_id === item.id,
            );
            return (
              <SelectionOptionCard
                key={item.id}
                compact
                title={item.name}
                description={
                  item.is_magical ? "Item mágico" : "Equipamento mundano"
                }
                selected={selected}
                facts={[
                  { label: "Preço", value: `${item.cost_gp} PO` },
                ]}
                onSelect={() => onChange(toggleShopPurchase(state, item))}
              />
            );
          })}
        </div>
      )}

      {state.shop_purchases.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {state.shop_purchases.map((entry) => (
            <ChipToggle
              key={entry.item_id}
              label={`${entry.item_name} (${entry.unit_price_gp} PO)`}
              selected
              onToggle={() =>
                onChange(toggleShopPurchase(state, {
                  id: entry.item_id,
                  name: entry.item_name,
                  cost_gp: entry.unit_price_gp,
                  is_magical: entry.is_magical,
                }))
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
