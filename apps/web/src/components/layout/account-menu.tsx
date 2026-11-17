"use client";

import { ChevronDownIcon, LogOutIcon, TicketIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { AuthUser } from "@/types/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground"
    >
      {initials(name)}
    </span>
  );
}

export function AccountMenu({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={t("account", { name: user.name })}
        className="flex h-10 items-center gap-2 rounded-full border-[1.5px] bg-card py-1 pl-1 pr-1 text-[14.5px] font-semibold text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-secondary md:pr-2.5"
      >
        <Avatar name={user.name} />
        <span className="hidden max-w-[260px] truncate md:inline">
          {user.name}
        </span>
        <ChevronDownIcon className="hidden size-4 text-muted-foreground md:block" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 gap-0 p-0">
        <div className="flex items-center gap-3 p-3.5">
          <Avatar name={user.name} />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-snug break-words">
              {user.name}
            </p>
            <p className="font-mono text-[13px] text-muted-foreground">
              {user.phone}
            </p>
          </div>
        </div>
        <div className="border-t p-1.5">
          <Link
            href="/tickets"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[14.5px] font-medium text-foreground outline-none transition-colors hover:bg-secondary focus-visible:bg-secondary"
          >
            <TicketIcon className="size-4 text-muted-foreground" />
            {t("tickets")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[14.5px] font-medium text-foreground outline-none transition-colors hover:bg-secondary focus-visible:bg-secondary"
          >
            <LogOutIcon className="size-4 text-muted-foreground" />
            {t("logout")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
