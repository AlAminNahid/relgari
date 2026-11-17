"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const t = useTranslations("nav");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-brand-deep/40 supports-backdrop-filter:backdrop-blur-md" />
        <DialogPrimitive.Popup
          aria-describedby="logout-body"
          initialFocus={() => document.getElementById("logout-stay")}
          className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,400px)] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-6 text-center outline-none drop-shadow-[0_24px_36px_rgba(6,56,43,.35)] duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-red-soft text-brand-red">
            <LogOutIcon className="size-7" />
          </span>
          <DialogTitle className="mt-4 text-[20px] font-extrabold">
            {t("logoutTitle")}
          </DialogTitle>
          <p
            id="logout-body"
            className="mt-1.5 text-[15px] text-muted-foreground"
          >
            {t("logoutBody")}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              id="logout-stay"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="h-12 rounded-xl text-[15px] font-semibold"
            >
              {t("logoutStay")}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={pending}
              className="h-12 rounded-xl bg-brand-red text-[15px] font-bold text-white hover:bg-brand-red/90"
            >
              {pending ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
