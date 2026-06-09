import { ChipToggle, SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import { ChoicesShopSection } from "@/features/character-builder/components/steps/choices/ChoicesShopSection";
import {
  effectiveEquipmentMode,
  isSimplifiedEquipmentMode,
  resolveStartingGoldGp,
  supportsEquipmentModeToggle,
} from "@/features/character-builder/domain/equipment/equipment-mode";
import {
  formatStartingGoldPreview,
  startingGoldHasBonus,
} from "@/features/character-builder/domain/equipment/starting-gold";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
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
  const totalLevel = totalCharacterLevel(state);
  const showModeToggle = supportsEquipmentModeToggle(totalLevel);
  const mode = effectiveEquipmentMode(totalLevel, state.equipment_mode);
  const hasStartingGoldBonus = startingGoldHasBonus(totalLevel);
  const startingGoldPreview = formatStartingGoldPreview(totalLevel);
  const startingGoldGp = resolveStartingGoldGp(state);

  return (
    <section className="space-y-3">
      {showModeToggle ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Modo de equipamento</p>
          <div className="flex flex-wrap gap-1.5">
            <ChipToggle
              label="Simplificado — pacote"
              selected={mode === "background"}
              onToggle={() =>
                onChange({
                  ...state,
                  equipment_mode: "background",
                  shop_purchases: [],
                })
              }
            />
            {hasStartingGoldBonus ? (
              <ChipToggle
                label="Simplificado — ouro PHB"
                selected={mode === "starting_gold"}
                onToggle={() =>
                  onChange({
                    ...state,
                    equipment_mode: "starting_gold",
                    shop_purchases: [],
                  })
                }
              />
            ) : null}
            <ChipToggle
              label="Campanha — loja"
              selected={mode === "campaign_shop"}
              onToggle={() =>
                onChange({
                  ...state,
                  equipment_mode: "campaign_shop",
                  equipment_option_key: null,
                  shop_purchases: [],
                })
              }
            />
          </div>
          <p className="text-xs text-muted">
            {isSimplifiedEquipmentMode(mode)
              ? "Modo simplificado: pacote do antecedente ou ouro sem compras."
              : "Modo campanha: gaste o ouro PHB na loja (itens mágicos a partir do nível 5)."}
          </p>
        </div>
      ) : null}

      {mode === "campaign_shop" ? (
        <ChoicesShopSection state={state} onChange={onChange} />
      ) : null}

      {mode === "starting_gold" ? (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground">Ouro inicial (PHB 2024)</p>
          {startingGoldPreview ? (
            <p className="mt-2 text-sm text-muted">
              Referência:{" "}
              <span className="font-medium text-foreground">{startingGoldPreview}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm text-foreground">
            Valor enviado ao criar:{" "}
            <span className="font-semibold">
              {startingGoldGp.toLocaleString("pt-BR")} PO
            </span>
            {hasStartingGoldBonus ? " (média do dado)" : ""}
          </p>
          <p className="mt-2 text-xs text-muted">
            O pacote escolhido do antecedente também será enviado.
          </p>
        </div>
      ) : null}

      {mode === "background" || mode === "starting_gold" ? (
        background.equipment_options.length === 0 ? (
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
                    equipment_mode:
                      mode === "starting_gold" ? "starting_gold" : "background",
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
        )
      ) : null}

      {showModeToggle && mode === "background" && startingGoldPreview ? (
        <p className="text-xs text-muted">
          Referência PHB (nível {totalLevel}): {startingGoldPreview}.
          {hasStartingGoldBonus
            ? " Disponível escolhendo \"Ouro inicial PHB\" acima."
            : ""}
        </p>
      ) : null}
    </section>
  );
}
