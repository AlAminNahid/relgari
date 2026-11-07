"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthTicket } from "@/components/sections/auth/auth-ticket";
import { LoginForm } from "@/components/sections/auth/login-form";
import { RegisterForm } from "@/components/sections/auth/register-form";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

type Mode = "login" | "register";

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  function handleSuccess() {
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setMode("login");
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-brand-deep/40 supports-backdrop-filter:backdrop-blur-md" />
        <DialogPrimitive.Popup
          aria-describedby={undefined}
          initialFocus={() =>
            document.getElementById(
              mode === "login" ? "login-phone" : "register-name",
            )
          }
          className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,430px)] -translate-x-1/2 -translate-y-1/2 outline-none drop-shadow-[0_28px_40px_rgba(0,0,0,.4)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <AuthTicket tag={mode === "login" ? t("tagLogin") : t("tagRegister")}>
            {mode === "login" ? (
              <LoginForm
                onSwitch={() => setMode("register")}
                onSuccess={handleSuccess}
              />
            ) : (
              <RegisterForm
                onSwitch={() => setMode("login")}
                onSuccess={handleSuccess}
              />
            )}
          </AuthTicket>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
