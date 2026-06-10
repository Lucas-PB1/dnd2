import { SheetDetailModal } from "@/features/character-sheet/components/sheet/SheetDetailModal";
import { SpellDetailContent } from "@/features/character-sheet/components/sheet/spells/SpellDetailContent";
import type { SpellModalState } from "@/features/character-sheet/components/sheet/spells/spell-section-types";

type SpellDetailDialogProps = {
  modal: SpellModalState;
  loading: boolean;
  description: string | null;
  onClose: () => void;
};

export function SpellDetailDialog({
  modal,
  loading,
  description,
  onClose,
}: SpellDetailDialogProps) {
  const title =
    modal?.type === "known"
      ? modal.spell.name
      : modal?.type === "trait"
        ? modal.spell.spell_name
        : "";

  return (
    <SheetDetailModal open={modal != null} title={title} onClose={onClose}>
      {modal?.type === "known" ? (
        <>
          <SpellDetailContent spell={modal.spell} />
          {loading ? (
            <p className="mt-4">Carregando descrição…</p>
          ) : description ? (
            <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4">
              {description}
            </p>
          ) : null}
        </>
      ) : modal?.type === "trait" ? (
        <>
          <p className="text-xs text-muted-subtle">
            {[modal.spell.trait_name, modal.spell.trait_option_name]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {loading ? (
            <p className="mt-4">Carregando descrição…</p>
          ) : description ? (
            <p className="mt-4 whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="mt-4 text-muted-subtle">Sem descrição disponível.</p>
          )}
        </>
      ) : null}
    </SheetDetailModal>
  );
}
