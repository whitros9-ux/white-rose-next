"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type OrderItem = { id: string; name: string; quantity: number; size: string | null; color: string | null; unitPriceUsd: number; lineTotalUsd: number };
export type Order = {
  orderId: string;
  createdAt: string;
  expectedDelivery: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  customer: { name: string; phone: string; email: string | null; city: string; address: string };
  paymentMethod: string;
  paymentMethodLabel: string;
  items: OrderItem[];
  totals: { subtotalYER: string; shippingYER: string; totalYER: string };
};

type OrdersContextValue = { orders: Order[]; addOrder: (o: Omit<Order, "status" | "expectedDelivery">) => void };
const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "@whiterose/orders/v1";

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch { /* ignore */ }
  }, [orders]);

  const addOrder = useCallback((o: Omit<Order, "status" | "expectedDelivery">) => {
    const expectedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    setOrders((prev) => [{ ...o, status: "pending", expectedDelivery }, ...prev]);
  }, []);

  return <OrdersContext.Provider value={{ orders, addOrder }}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
