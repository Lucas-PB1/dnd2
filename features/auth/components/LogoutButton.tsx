"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logout } from "@/features/auth/services/auth.service";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="md"
      fullWidth={false}
      icon={<LogOut className="size-4" />}
      className="px-3"
      onClick={() => void logout()}
    >
      Sair
    </Button>
  );
}
