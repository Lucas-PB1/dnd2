export function fieldControlClass({
  error,
  className = "",
}: {
  error?: boolean;
  className?: string;
} = {}) {
  return [
    "box-border min-h-11 min-w-0 w-full max-w-full rounded-lg border bg-background/55 px-3 py-2 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] transition-[background-color,border-color,box-shadow,color]",
    "placeholder:text-muted-subtle hover:border-border-strong hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error ? "border-danger/70" : "border-border",
    className,
  ].join(" ");
}
