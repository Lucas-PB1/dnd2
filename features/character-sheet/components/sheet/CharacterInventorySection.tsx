"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { SheetDetailModal } from "@/features/character-sheet/components/sheet/SheetDetailModal";
import {
  attunementSummary,
  partitionInventory,
} from "@/features/character-sheet/domain/sheet-sections/inventory-display";
import type {
  CharacterInventoryItem,
} from "@/shared/character";

type CharacterInventorySectionProps = {
  inventory: CharacterInventoryItem[];
};

function itemDetail(item: CharacterInventoryItem): string {
  if (item.item_type === "Weapon") {
    return [
      item.weapon_category,
      item.damage_die
        ? `${item.die_count ?? 1}${item.damage_die} ${item.damage_type ?? ""}`.trim()
        : null,
      item.mastery_name ? `Maestria ${item.mastery_name}` : null,
      item.weapon_properties,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (item.item_type === "Armor") {
    return [
      item.armor_category,
      item.ac_bonus == null ? null : `CA ${item.ac_bonus}`,
      item.min_strength ? `For ${item.min_strength}` : null,
      item.stealth_disadvantage ? "Furtividade em desvantagem" : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return [
    item.weight_lb == null ? null : `${item.weight_lb} lb`,
    item.cost_gp == null ? null : `${item.cost_gp} PO`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function ItemDetailContent({ item }: { item: CharacterInventoryItem }) {
  const detail = itemDetail(item);
  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-xs text-muted-subtle">Tipo</dt>
        <dd>{item.item_type}</dd>
      </div>
      {detail ? (
        <div>
          <dt className="text-xs text-muted-subtle">Propriedades</dt>
          <dd>{detail}</dd>
        </div>
      ) : null}
      {item.weight_lb != null ? (
        <div>
          <dt className="text-xs text-muted-subtle">Peso</dt>
          <dd>{item.weight_lb} lb</dd>
        </div>
      ) : null}
      {item.cost_gp != null ? (
        <div>
          <dt className="text-xs text-muted-subtle">Custo</dt>
          <dd>{item.cost_gp} PO</dd>
        </div>
      ) : null}
      {item.mastery_name ? (
        <div>
          <dt className="text-xs text-muted-subtle">Maestria</dt>
          <dd>{item.mastery_name}</dd>
        </div>
      ) : null}
      {item.requires_attunement ? (
        <div>
          <dt className="text-xs text-muted-subtle">Sintonização</dt>
          <dd>{item.is_attuned ? "Sintonizado" : "Requer sintonização"}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function CharacterInventorySection({
  inventory,
}: CharacterInventorySectionProps) {
  const partitions = partitionInventory(inventory);
  const attunement = attunementSummary(inventory);
  const [modalItem, setModalItem] = useState<CharacterInventoryItem | null>(null);

  if (inventory.length === 0) return null;

  return (
    <>
      <Surface className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-foreground">Inventário</h2>
          <div className="flex items-center gap-3 text-xs text-muted-subtle">
            <span>{inventory.length} itens</span>
            {attunement.attuned > 0 || inventory.some((i) => i.requires_attunement) ? (
              <span className={attunement.atLimit ? "text-brand" : undefined}>
                Sintonização {attunement.attuned}/{attunement.max}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {partitions.map((partition) => (
            <section key={partition.key}>
              <h3 className="text-xs font-medium text-muted">{partition.label}</h3>
              <div className="mt-2 grid gap-2">
                {partition.items.map((item) => {
                  const detail = itemDetail(item);
                  return (
                    <div
                      key={item.item_id}
                      className="rounded-md border border-border/70 bg-surface/35 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.name}
                            {item.quantity > 1 ? ` x${item.quantity}` : ""}
                          </p>
                          {detail ? (
                            <p className="mt-0.5 text-xs text-muted-subtle">{detail}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {item.is_magical ? (
                            <Badge tone="accent">Mágico</Badge>
                          ) : null}
                          {item.requires_attunement ? (
                            <Badge tone={item.is_attuned ? "success" : "neutral"}>
                              {item.is_attuned ? "Sintonizado" : "Sintonizar"}
                            </Badge>
                          ) : null}
                          {item.is_consumable ? (
                            <Badge tone="neutral">Consumível</Badge>
                          ) : null}
                          <button
                            type="button"
                            className="rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground"
                            aria-label={`Detalhes de ${item.name}`}
                            onClick={() => setModalItem(item)}
                          >
                            <Info className="size-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </Surface>

      <SheetDetailModal
        open={modalItem != null}
        title={modalItem?.name ?? ""}
        onClose={() => setModalItem(null)}
      >
        {modalItem ? <ItemDetailContent item={modalItem} /> : null}
      </SheetDetailModal>
    </>
  );
}
