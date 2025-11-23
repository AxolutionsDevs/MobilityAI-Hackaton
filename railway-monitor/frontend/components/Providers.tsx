"use client";

import { CityProvider } from "@/lib/CityContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <CityProvider>{children}</CityProvider>;
}
