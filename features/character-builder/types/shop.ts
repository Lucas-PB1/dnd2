export type EquipmentMode = "background" | "starting_gold" | "campaign_shop";

export type ShopPurchase = {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price_gp: number;
  is_magical: boolean;
};
