"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  importBuilderState,
  serializeBuilderExport,
} from "@/features/character-builder/domain/build-export";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

type BuilderImportExportProps = {
  state: CharacterBuilderState;
  onImport: (state: CharacterBuilderState) => void;
};

export function BuilderImportExport({ state, onImport }: BuilderImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([serializeBuilderExport(state)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `build-${state.name.trim() || "personagem"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const imported = importBuilderState(text);
    onImport(imported);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="md"
        className="w-auto!"
        onClick={handleExport}
      >
        <Download className="size-4" aria-hidden />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="md"
        className="w-auto!"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-4" aria-hidden />
        <span className="hidden sm:inline">Importar</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImportFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
