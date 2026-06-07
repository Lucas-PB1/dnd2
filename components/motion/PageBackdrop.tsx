import type { ReactNode } from "react";

const GRADIENT_CLASS = {
  center:
    "bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-brand-glow/30 via-background to-background",
  top: "bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-glow/30 via-background to-background",
} as const;

type PageBackdropProps = {
  variant?: keyof typeof GRADIENT_CLASS;
  children: ReactNode;
  className?: string;
};

export function PageBackdrop({
  variant = "center",
  children,
  className = "",
}: PageBackdropProps) {
  return (
    <div className={`relative flex flex-1 flex-col ${className}`}>
      <div
        className={`pointer-events-none absolute inset-0 ${GRADIENT_CLASS[variant]}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}
