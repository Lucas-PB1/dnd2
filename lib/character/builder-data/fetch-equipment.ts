import type {
  BuilderEquipmentItem,
  BuilderEquipmentOption,
} from "@/features/character/types/builder.types";

type EquipmentRow = {
  background_id: number;
  option_key: string;
  label: string | null;
  gp_amount: number | null;
  option_notes: string | null;
  item_name: string | null;
  quantity: number | null;
  item_notes: string | null;
  item_id: number | null;
};

export function buildEquipmentOptionsFromRows(
  rows: EquipmentRow[],
): BuilderEquipmentOption[] {
  const options: BuilderEquipmentOption[] = [];

  for (const row of rows) {
    let option = options.find((entry) => entry.option_key === row.option_key);
    if (!option) {
      option = {
        option_key: row.option_key,
        label: row.label,
        gp_amount: row.gp_amount,
        notes: row.option_notes,
        items: [],
      };
      options.push(option);
    }
    if (row.item_name) {
      option.items.push({
        item_id: row.item_id,
        item_name: row.item_name,
        quantity: row.quantity ?? 1,
        notes: row.item_notes,
      } satisfies BuilderEquipmentItem);
    }
  }

  return options;
}
