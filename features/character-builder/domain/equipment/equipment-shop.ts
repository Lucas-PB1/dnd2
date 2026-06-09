import {
  magicItemsAllowedAtLevel,
  maxMagicItemCostGp,
} from "@/features/character-builder/domain/equipment/magic-items-by-level";
import { effectiveEquipmentModeForState } from "@/features/character-builder/domain/equipment/equipment-mode";
import { startingGoldGpForLevel } from "@/features/character-builder/domain/equipment/starting-gold";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import type {
  CharacterBuilderState,
  ShopPurchase,
} from "@/features/character-builder/types/builder.types";

export type ShopItemRow = {
  id: number;
  name: string;
  cost_gp: number;
  is_magical: boolean;
};

export function shopBudgetGp(state: CharacterBuilderState): number {
  const mode = effectiveEquipmentModeForState(state);
  if (mode !== "starting_gold" && mode !== "campaign_shop") {
    return 0;
  }
  return startingGoldGpForLevel(totalCharacterLevel(state), "average");
}

export function shopSpentGp(purchases: ShopPurchase[]): number {
  return purchases.reduce(
    (sum, entry) => sum + entry.unit_price_gp * entry.quantity,
    0,
  );
}

export function shopRemainingGp(state: CharacterBuilderState): number {
  return Math.max(0, shopBudgetGp(state) - shopSpentGp(state.shop_purchases));
}

export function canAffordPurchase(
  state: CharacterBuilderState,
  unitPriceGp: number,
  quantity = 1,
): boolean {
  return shopRemainingGp(state) >= unitPriceGp * quantity;
}

export function filterShopItemsForLevel(
  items: ShopItemRow[],
  characterLevel: number,
): ShopItemRow[] {
  const allowMagic = magicItemsAllowedAtLevel(characterLevel);
  const maxMagicCost = maxMagicItemCostGp(characterLevel);

  return items.filter((item) => {
    if (!item.is_magical) return true;
    if (!allowMagic) return false;
    return item.cost_gp <= maxMagicCost;
  });
}

export function toggleShopPurchase(
  state: CharacterBuilderState,
  item: ShopItemRow,
): CharacterBuilderState {
  const existing = state.shop_purchases.find((entry) => entry.item_id === item.id);

  if (existing) {
    return {
      ...state,
      shop_purchases: state.shop_purchases.filter(
        (entry) => entry.item_id !== item.id,
      ),
    };
  }

  if (!canAffordPurchase(state, item.cost_gp)) {
    return state;
  }

  return {
    ...state,
    shop_purchases: [
      ...state.shop_purchases,
      {
        item_id: item.id,
        item_name: item.name,
        quantity: 1,
        unit_price_gp: item.cost_gp,
        is_magical: item.is_magical,
      },
    ],
  };
}

export function buildShopInventory(
  purchases: ShopPurchase[],
): { item_id: number; quantity: number; is_equipped: boolean }[] {
  return purchases.map((entry) => ({
    item_id: entry.item_id,
    quantity: entry.quantity,
    is_equipped: false,
  }));
}

export function validateShopPurchases(state: CharacterBuilderState): string | null {
  const spent = shopSpentGp(state.shop_purchases);
  const budget = shopBudgetGp(state);
  if (spent > budget) {
    return "Compras excedem o ouro disponível.";
  }
  return null;
}
