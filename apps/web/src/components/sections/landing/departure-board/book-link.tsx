"use client";

import { ROUTE_EVENT } from "@/config/site";

export function BookLink({
  route,
  children,
}: {
  route: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#search"
      onClick={() => {
        const [from, to] = route.split(" → ");
        window.dispatchEvent(
          new CustomEvent(ROUTE_EVENT, { detail: { from, to } }),
        );
      }}
      className="text-sm font-semibold text-[#ffcf5a] hover:underline"
    >
      {children}
    </a>
  );
}
