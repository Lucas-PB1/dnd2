import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { sortInventory } from "@/features/character-sheet/domain/sheet-display";
import type {
  CharacterInventoryItem,
} from "@/features/character-sheet/types/character.types";

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

export function CharacterInventorySection({
  inventory,
}: CharacterInventorySectionProps) {
  if (inventory.length === 0) return null;

  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">Inventário</h2>
        <span className="text-xs text-muted-subtle">{inventory.length} itens</span>
      </div>

      <div className="mt-4 grid gap-2">
        {sortInventory(inventory).map((item) => {
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
                  {item.is_equipped ? <Badge tone="success">Equipado</Badge> : null}
                  {item.is_magical ? <Badge tone="accent">Mágico</Badge> : null}
                  {item.requires_attunement ? (
                    <Badge tone={item.is_attuned ? "success" : "neutral"}>
                      {item.is_attuned ? "Sintonizado" : "Sintonizar"}
                    </Badge>
                  ) : null}
                  {item.is_consumable ? <Badge tone="neutral">Consumível</Badge> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
