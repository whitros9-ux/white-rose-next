"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { categories as defaultCategories, products as defaultProducts, type Category, type Product } from "@/constants/products";

type StoreContextValue = {
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
  newProducts: Product[];
  shippingFee: number;
  freeShippingThreshold: number;
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, changes: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  setShippingFee: (fee: number) => void;
  setFreeShippingThreshold: (threshold: number) => void;
  reduceStock: (id: string, qty: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [shippingFee, setShippingFee] = useState(25);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

  const value = useMemo(() => ({
    categories,
    products,
    featuredProducts: products.filter((p) => p.isBestseller),
    newProducts: products.filter((p) => p.isNew),
    shippingFee,
    freeShippingThreshold,
    getProduct: (id: string) => products.find((p) => p.id === id),
    addProduct: (product: Product) => setProducts((prev) => [product, ...prev]),
    updateProduct: (id: string, changes: Partial<Product>) =>
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...changes } : p)),
    removeProduct: (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    addCategory: (category: Category) => setCategories((prev) => [...prev, category]),
    setShippingFee,
    setFreeShippingThreshold,
    reduceStock: (id: string, qty: number) =>
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p)),
  }), [products, categories, shippingFee, freeShippingThreshold]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
