"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { LanguageSwitch } from "@/components/layout/language-switch";
import { Logo } from "@/components/layout/logo";

const bookClass = cn(
  buttonVariants(),
  "h-10 rounded-[10px] bg-brand-red px-4 text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(226,38,59,.7)] hover:bg-brand-red/90",
);

export function Navbar() {
  const t = useTranslations("nav");

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
          <Button
            variant="outline"
            className="hidden h-10 rounded-[10px] px-4 text-[15px] font-semibold sm:inline-flex"
          >
            {t("login")}
          </Button>
          <a href="#search" className={cn(bookClass, "hidden sm:inline-flex")}>
            {t("book")}
          </a>
          <Sheet>
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
                <Button
                  variant="outline"
                  className="h-11 rounded-[10px] text-base font-semibold"
                >
                  {t("login")}
                </Button>
                <SheetClose
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
    </header>
  );
}
