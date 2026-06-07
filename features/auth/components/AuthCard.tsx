import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-block text-xs font-semibold uppercase tracking-[0.35em] text-amber-500/80 transition-colors hover:text-amber-400"
        >
          D&amp;D 2024
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-amber-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-stone-400">{subtitle}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-amber-900/30 bg-stone-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
        {children}
      </div>

      {footer ? (
        <div className="mt-6 text-center text-sm text-stone-400">{footer}</div>
      ) : null}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-6" role="separator" aria-label="ou">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-stone-700/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-stone-900/70 px-3 text-stone-500">ou</span>
      </div>
    </div>
  );
}

export function AuthAlert({
  variant,
  message,
}: {
  variant: "error" | "success" | "info";
  message: string;
}) {
  const styles = {
    error: "border-red-500/30 bg-red-950/40 text-red-200",
    success: "border-emerald-500/30 bg-emerald-950/40 text-emerald-200",
    info: "border-amber-500/30 bg-amber-950/30 text-amber-100",
  } as const;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {message}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
      {message}
    </p>
  );
}
