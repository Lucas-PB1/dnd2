import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { formatProficiencyBonus } from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/shared/character";

type CharacterVitalsSectionProps = {
  character: CharacterDetail;
};

function statLine(label: string, value: string | number | null) {
  return (
    <div className="min-w-0 rounded-md border border-border/70 bg-surface/35 px-3 py-2">
      <dt className="text-xs text-muted-subtle">{label}</dt>
      <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
        {value ?? "—"}
      </dd>
    </div>
  );
}

function deathSaves(successes: number, failures: number): string {
  return `${successes}/3 sucesso · ${failures}/3 falha`;
}

export function CharacterVitalsSection({
  character,
}: CharacterVitalsSectionProps) {
  const summary = character.sheet_summary;
  const dexterity = character.abilities.find((entry) => entry.ability === "DEX");
  const maxHp = summary?.effective_max_hp ?? summary?.max_hp ?? 1;

  if (!summary) return null;

  return (
    <Surface className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">Combate</h2>
        <Badge tone={summary.heroic_inspiration ? "success" : "neutral"}>
          Inspiração {summary.heroic_inspiration ? "sim" : "não"}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        {statLine("CA", summary.effective_armor_class)}
        {statLine(
          "Iniciativa",
          dexterity ? formatProficiencyBonus(dexterity.modifier) : null,
        )}
        {statLine("Desloc.", `${summary.effective_speed} ft`)}
        {statLine("Percepção", character.passive_perception)}
      </dl>

      <div className="mt-3 rounded-md border border-border/70 bg-surface/35 px-3 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-muted-subtle">Pontos de vida</span>
          <span className="text-sm font-medium tabular-nums text-foreground">
            {summary.current_hp}/{maxHp}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-success"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, (summary.current_hp / maxHp) * 100),
              )}%`,
            }}
          />
        </div>
        {summary.temporary_hp > 0 ? (
          <p className="mt-2 text-xs text-accent-soft">
            {summary.temporary_hp} PV temporário
          </p>
        ) : null}
      </div>

      <dl className="mt-3 grid gap-2">
        <div className="rounded-md border border-border/70 bg-surface/35 px-3 py-2">
          <dt className="text-xs text-muted-subtle">Salvaguardas contra morte</dt>
          <dd className="mt-1 text-sm text-foreground">
            {deathSaves(summary.death_save_successes, summary.death_save_failures)}
          </dd>
        </div>
        {summary.conditions ? (
          <div className="rounded-md border border-danger/35 bg-danger-surface px-3 py-2">
            <dt className="text-xs text-danger">Condições</dt>
            <dd className="mt-1 text-sm text-foreground">{summary.conditions}</dd>
          </div>
        ) : null}
      </dl>
    </Surface>
  );
}
