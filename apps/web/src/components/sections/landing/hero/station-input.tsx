"use client";

import type { ReactNode } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useLocale } from "next-intl";
import { stationMatches, stationName } from "@/lib/stations";
import type { Station } from "@/types/api";

export function StationInput({
  id,
  stations,
  value,
  onChange,
  placeholder,
  emptyText,
  icon,
}: {
  id: string;
  stations: Station[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyText: string;
  icon: ReactNode;
}) {
  const locale = useLocale();

  return (
    <Autocomplete.Root
      items={stations}
      value={value}
      onValueChange={onChange}
      itemToStringValue={(station: Station) => stationName(station, locale)}
      filter={(station: Station, query) => stationMatches(station, query)}
      openOnInputClick
      autoHighlight
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary [&>svg]:size-[18px]">
          {icon}
        </span>
        <Autocomplete.Input
          id={id}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          className="h-[52px] w-full min-w-0 rounded-xl bg-white pl-11 pr-3 text-[17px] font-semibold text-foreground outline-none transition-shadow placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-white/50"
        />
      </div>
      {stations.length > 0 ? (
        <Autocomplete.Portal>
          <Autocomplete.Positioner
            sideOffset={6}
            align="start"
            className="isolate z-50"
          >
            <Autocomplete.Popup className="max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
              <Autocomplete.Empty className="px-3 py-2.5 text-sm text-muted-foreground empty:hidden">
                {emptyText}
              </Autocomplete.Empty>
              <Autocomplete.List>
                {(station: Station) => (
                  <Autocomplete.Item
                    key={station.code}
                    value={station}
                    className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15.5px] font-medium outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  >
                    {stationName(station, locale)}
                    <span className="font-mono text-xs text-muted-foreground">
                      {station.code}
                    </span>
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      ) : null}
    </Autocomplete.Root>
  );
}
