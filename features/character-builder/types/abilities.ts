export const ABILITY_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export type AbilityMethod = "standard" | "point_buy" | "roll";

export type BackgroundAsiMode = "split" | "even";
