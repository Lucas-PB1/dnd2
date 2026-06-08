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
  const showModeToggle = supportsEquipmentModeToggle(state.class_level);
  const mode = effectiveEquipmentMode(state.class_level, state.equipment_mode);
  const startingGoldPreview = formatStartingGoldPreview(totalCharacterLevel(state));
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
            <ChipToggle
              label="Simplificado — ouro PHB"
              selected={mode === "starting_gold"}
              onToggle={() =>
                onChange({
                  ...state,
                  equipment_mode: "starting_gold",
                  equipment_option_key: null,
                  shop_purchases: [],
                })
              }
            />
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
            {startingGoldHasBonus(state.class_level) ? " (média do dado)" : ""}
          </p>
          {!startingGoldHasBonus(state.class_level) ? (
            <p className="mt-2 text-xs text-muted">
              Neste nível não há bônus de ouro PHB; o personagem começa sem pacote de
              equipamento do antecedente.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Sem itens do pacote do antecedente. Use a loja de campanha para equipar.
            </p>
          )}
        </div>
      ) : null}

      {mode === "background" ? (
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
                    equipment_mode: "background",
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
          Referência PHB (nível {state.class_level}): {startingGoldPreview}. Disponível
          escolhendo &quot;Ouro inicial PHB&quot; acima.
        </p>
      ) : null}
    </section>
  );
}
