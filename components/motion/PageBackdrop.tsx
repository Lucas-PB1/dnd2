import type { ReactNode } from "react";

type PageBackdropProps = {
  variant?: "center" | "top";
  children: ReactNode;
  className?: string;
};

export function PageBackdrop({
  variant = "center",
  children,
  className = "",
}: PageBackdropProps) {
  return (
    <div className={`editorial-backdrop relative flex flex-1 flex-col ${className}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            variant === "top"
              ? "linear-gradient(180deg, rgb(199 161 90 / 0.08), transparent 34%)"
              : "linear-gradient(180deg, rgb(106 189 177 / 0.035), transparent 45%)",
        }}
        aria-hidden
      />
      <div
        className="editorial-noise pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
      />
      {children}
    </div>
  );
}
