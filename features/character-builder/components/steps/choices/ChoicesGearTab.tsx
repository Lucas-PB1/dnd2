import { SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import type { BuilderBackgroundEntry } from "@/features/character-builder/types/builder.types";
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
    <section className="space-y-3">
      {state.class_level > 1 ? (
        <p className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted">
          Simplificação v1: personagens acima do nível 1 usam o pacote de
          equipamento do antecedente (como no nível 1). Ouro inicial
          proporcional ao nível (DMG) fica para uma versão futura.
        </p>
      ) : null}
      {background.equipment_options.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma opção de equipamento cadastrada.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {background.equipment_options.map((opt) => (
            <SelectionOptionCard
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
