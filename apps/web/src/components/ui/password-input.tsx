"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  showLabel: string;
  hideLabel: string;
};

// Password box with an eye button: open eye shows the password, crossed eye hides it.
export function PasswordInput({ showLabel, hideLabel, className, ...props }: PasswordInputProps) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative">
      <Input {...props} type={shown ? "text" : "password"} className={cn("pr-11", className)} />
      <button
        type="button"
        aria-label={shown ? hideLabel : showLabel}
        onClick={() => setShown((s) => !s)}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
      >
        {shown ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
      </button>
    </div>
  );
}
