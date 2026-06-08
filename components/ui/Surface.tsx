import type { HTMLAttributes, ReactNode } from "react";

type SurfaceTone = "default" | "raised" | "subtle" | "dashed";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  tone?: SurfaceTone;
  interactive?: boolean;
  children: ReactNode;
};

const toneClasses: Record<SurfaceTone, string> = {
  default: "editorial-card",
  raised: "editorial-surface",
  subtle: "border border-border bg-surface/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]",
  dashed: "border border-dashed border-border-strong bg-surface/25",
};

export function Surface({
  tone = "default",
  interactive = false,
  className = "",
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={`rounded-lg ${toneClasses[tone]} ${
        interactive ? "editorial-card-interactive" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
