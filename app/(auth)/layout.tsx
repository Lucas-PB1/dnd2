import type { Metadata } from "next";
import { PageBackdrop } from "@/components/motion/PageBackdrop";

export const metadata: Metadata = {
  title: "Autenticação",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageBackdrop
      variant="top"
      className="min-h-svh w-full items-center justify-center px-4 py-10 sm:px-6"
    >
      <main className="relative z-10 flex w-full max-w-md flex-col items-center">
        {children}
      </main>
    </PageBackdrop>
  );
}
