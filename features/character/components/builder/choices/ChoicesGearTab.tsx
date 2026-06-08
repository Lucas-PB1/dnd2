import { SelectionCard } from "@/features/character/components/builder/BuilderParts";
import type { BuilderBackgroundEntry } from "@/features/character/types/builder.types";
import type { ChoicesTabProps } from "./types";

type ChoicesGearTabProps = ChoicesTabProps & {
  background: BuilderBackgroundEntry;
};

function equipmentCardTitle(
  optionKey: string,
  label: string | null,
): string {
  if (label) return label;
  if (optionKey === "A") return "Opção A — itens";
  if (optionKey === "B") return "Opção B — ouro";
  return optionKey;
}

function equipmentDescription(
  items: { quantity: number; item_name: string }[],
  gpAmount: number | null,
  notes: string | null,
): string | undefined {
  const itemList = items
    .map((item) => `${item.quantity}× ${item.item_name}`)
    .join(", ");
  return (
    itemList ||
    (gpAmount ? `${gpAmount} PO para comprar equipamento` : null) ||
    notes ||
    undefined
  );
}

export function ChoicesGearTab({
  state,
  onChange,
  background,
}: ChoicesGearTabProps) {
  return (
    <section>
      {background.equipment_options.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma opção de equipamento cadastrada.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {background.equipment_options.map((opt) => (
            <SelectionCard
              key={opt.option_key}
              compact
              title={equipmentCardTitle(opt.option_key, opt.label)}
              description={equipmentDescription(
                opt.items,
                opt.gp_amount,
                opt.notes,
              )}
              selected={state.equipment_option_key === opt.option_key}
              onSelect={() =>
                onChange({
                  ...state,
                  equipment_option_key: opt.option_key,
                })
              }
              facts={
                opt.gp_amount
                  ? [{ label: "Ouro", value: `${opt.gp_amount} PO` }]
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
