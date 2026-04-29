"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/constants/products";
import { useStore } from "./StoreContext";

export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (productId: string, opts?: { size?: string; color?: string }) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isInCart: (productId: string) => boolean;
  getItemProduct: (item: CartItem) => Product | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "@whiterose/cart/v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { shippingFee, freeShippingThreshold } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = useCallback((productId: string, opts?: { size?: string; color?: string }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, quantity: 1, size: opts?.size, color: opts?.color }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const isInCart = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);
  const getItemProduct = useCallback((item: CartItem) => products.find((p) => p.id === item.productId), []);

  const subtotal = useMemo(() =>
    items.reduce((sum, i) => {
      const p = products.find((pr) => pr.id === i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0), [items]);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, shipping, total, add, remove, setQuantity, clear, isInCart, getItemProduct }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
