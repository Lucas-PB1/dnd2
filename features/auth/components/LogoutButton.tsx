"use client";

import { Button } from "@/components/ui/Button";
import { logout } from "@/features/auth/services/auth.service";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="md"
      className="w-auto! px-3"
      onClick={() => void logout()}
    >
      Sair
    </Button>
  );
}
