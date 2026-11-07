import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function AuthField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <Label
        htmlFor={id}
        className="mb-[5px] block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13.5px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
