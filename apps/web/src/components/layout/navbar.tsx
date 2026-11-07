"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AuthUser } from "@/types/api";
import { AuthDialog } from "@/components/sections/auth/auth-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";
import { logout } from "@/services/auth";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { Logo } from "@/components/layout/logo";

const bookClass = cn(
  buttonVariants(),
  "h-10 rounded-[10px] bg-brand-red px-4 text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(226,38,59,.7)] hover:bg-brand-red/90",
);

export function Navbar({ user }: { user: AuthUser | null }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1140px] items-center gap-6 px-5">
        <Logo />
        <nav aria-label="Main" className="ml-auto hidden gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="text-[15.5px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t(l.key)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          <LanguageSwitch />
          {user ? (
            <>
              <span
                title={user.name}
                className="hidden max-w-[150px] truncate text-[14.5px] text-muted-foreground md:inline"
              >
                {t("greeting", { name: user.name })}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden h-10 rounded-[10px] px-4 text-[15px] font-semibold sm:inline-flex"
              >
                {t("logout")}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setAuthOpen(true)}
              className="hidden h-10 rounded-[10px] px-4 text-[15px] font-semibold sm:inline-flex"
            >
              {t("login")}
            </Button>
          )}
          <a href="#search" className={cn(bookClass, "hidden sm:inline-flex")}>
            {t("book")}
          </a>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-[10px] lg:hidden"
                  aria-label={t("menu")}
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((l) => (
                  <SheetClose
                    key={l.key}
                    nativeButton={false}
                    render={
                      <a
                        href={l.href}
                        className="rounded-lg px-3 py-2.5 text-base font-medium hover:bg-secondary"
                      />
                    }
                  >
                    {t(l.key)}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                {user ? (
                  <>
                    <p className="truncate px-1 text-sm text-muted-foreground">
                      {t("greeting", { name: user.name })}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="h-11 rounded-[10px] text-base font-semibold"
                    >
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthOpen(true);
                    }}
                    className="h-11 rounded-[10px] text-base font-semibold"
                  >
                    {t("login")}
                  </Button>
                )}
                <SheetClose
                  nativeButton={false}
                  render={
                    <a
                      href="#search"
                      className={cn(bookClass, "h-11 justify-center text-base")}
                    />
                  }
                >
                  {t("book")}
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
