import type { ReactNode } from "react";

type GameTextListBlock = {
  kind: "list";
  intro: string | null;
  items: { label: string; text: string }[];
};

type GameTextProseBlock = {
  kind: "prose";
  sentences: string[];
};

type GameTextParagraphBlock = {
  kind: "paragraph";
  text: string;
};

export type GameTextBlock =
  | GameTextListBlock
  | GameTextProseBlock
  | GameTextParagraphBlock;

const LIST_LABEL_STARTERS = new Set([
  "A",
  "After",
  "All",
  "Additionally",
  "Alternatively",
  "An",
  "Any",
  "As",
  "At",
  "Before",
  "Both",
  "Cast",
  "Choose",
  "During",
  "Each",
  "Enter",
  "Every",
  "Gain",
  "If",
  "In",
  "It",
  "Make",
  "Neither",
  "No",
  "Not",
  "Once",
  "On",
  "One",
  "Regain",
  "Roll",
  "Some",
  "Spend",
  "Starting",
  "Take",
  "That",
  "The",
  "This",
  "Three",
  "Two",
  "Up",
  "Use",
  "Whenever",
  "When",
  "While",
  "With",
  "Without",
  "You",
  "Your",
]);

const LIST_INTRO_HINT =
  /(?:options|choices|effects|rules below|following|among your|one of the)/i;

function isLikelyListLabel(label: string): boolean {
  const words = label.split(/\s+/);
  if (words.length === 0 || words.length > 5) return false;
  if (LIST_LABEL_STARTERS.has(words[0])) return false;
  return words.every((word) => /^[A-Z]/.test(word));
}

function extractLabeledItems(
  text: string,
): { intro: string | null; items: { label: string; text: string }[] } | null {
  const pattern = /([A-Z][A-Za-z'']+(?: [A-Z][A-Za-z'']+){0,4})\.\s+/g;
  const markers: { index: number; label: string; matchLength: number }[] = [];

  for (const match of text.matchAll(pattern)) {
    const label = match[1];
    if (!label || !isLikelyListLabel(label)) continue;

    markers.push({
      index: match.index ?? 0,
      label,
      matchLength: match[0].length,
    });
  }

  if (markers.length === 0) return null;

  const intro = text.slice(0, markers[0].index).trim();
  const hasListContext = markers.length >= 2 || LIST_INTRO_HINT.test(intro);
  if (!hasListContext) return null;

  const items = markers.map((marker, index) => {
    const start = marker.index + marker.matchLength;
    const end = markers[index + 1]?.index ?? text.length;
    return {
      label: marker.label,
      text: text.slice(start, end).trim().replace(/\.\s*$/, ""),
    };
  });

  return { intro: intro || null, items };
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+(?=[A-Z("'])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function parseChunk(text: string): GameTextBlock {
  const list = extractLabeledItems(text);
  if (list) {
    return { kind: "list", ...list };
  }

  if (text.length > 260) {
    const sentences = splitSentences(text);
    if (sentences.length >= 3) {
      return { kind: "prose", sentences };
    }
  }

  return { kind: "paragraph", text };
}

export function parseGameDescription(raw: string): GameTextBlock[] {
  return raw
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n+/)
    .filter(Boolean)
    .map(parseChunk);
}

function GameTextList({ block }: { block: GameTextListBlock }) {
  return (
    <div className="space-y-2">
      {block.intro ? (
        <p className="leading-relaxed text-muted">{block.intro}</p>
      ) : null}
      <ul className="space-y-2">
        {block.items.map((item, index) => (
          <li
            key={`${index}-${item.label}`}
            className="rounded-md border border-border/60 bg-surface/20 px-2.5 py-2 leading-relaxed"
          >
            <span className="font-medium text-foreground">{item.label}.</span>{" "}
            <span className="text-muted">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GameTextProse({ block }: { block: GameTextProseBlock }) {
  return (
    <div className="space-y-2">
      {block.sentences.map((sentence) => (
        <p key={sentence} className="leading-relaxed text-muted">
          {sentence}
        </p>
      ))}
    </div>
  );
}

export function FormattedGameText({
  children,
  fallback = "Sem descrição cadastrada.",
}: {
  children?: string | null;
  fallback?: string;
}) {
  if (!children) {
    return <p className="leading-relaxed text-muted">{fallback}</p>;
  }

  const blocks = parseGameDescription(children);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.kind === "list") {
          return <GameTextList key={`list-${index}`} block={block} />;
        }

        if (block.kind === "prose") {
          return <GameTextProse key={`prose-${index}`} block={block} />;
        }

        return (
          <p key={`paragraph-${index}`} className="leading-relaxed text-muted">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function formatGameTextPreview(text: string, maxLength = 160): ReactNode {
  const firstBlock = parseGameDescription(text)[0];
  if (!firstBlock) return text;

  if (firstBlock.kind === "list") {
    const intro = firstBlock.intro ?? "";
    const itemLabels = firstBlock.items.map((item) => item.label).join(", ");
    const preview = [intro, itemLabels].filter(Boolean).join(" — ");
    return preview.length > maxLength
      ? `${preview.slice(0, maxLength - 1).trim()}…`
      : preview;
  }

  const source =
    firstBlock.kind === "prose"
      ? firstBlock.sentences.join(" ")
      : firstBlock.text;

  return source.length > maxLength
    ? `${source.slice(0, maxLength - 1).trim()}…`
    : source;
}
