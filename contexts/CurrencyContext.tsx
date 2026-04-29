"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Currency } from "@/lib/currency";

type CurrencyContextValue = { currency: Currency; setCurrency: (c: Currency) => void };
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("YER");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("@whiterose/currency");
      if (stored) setCurrencyState(stored as Currency);
    } catch { /* ignore */ }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem("@whiterose/currency", c); } catch { /* ignore */ }
  };

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
