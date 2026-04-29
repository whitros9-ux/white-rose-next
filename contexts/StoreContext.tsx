"use client";
import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { categories as defaultCategories, products as defaultProducts, type Category, type Product } from "@/constants/products";

type StoreContextValue = {
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
  newProducts: Product[];
  shippingFee: number;
  freeShippingThreshold: number;
  loading: boolean;
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, changes: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addCategory: (category: Category) => void;
  setShippingFee: (fee: number) => Promise<void>;
  setFreeShippingThreshold: (threshold: number) => Promise<void>;
  reduceStock: (id: string, qty: number) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories] = useState<Category[]>(defaultCategories);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [shippingFee, setShippingFeeState] = useState(25);
  const [freeShippingThreshold, setFreeShippingThresholdState] = useState(500);
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        seedingRef.current = true;
        const batch = writeBatch(db);
        defaultProducts.forEach((p) => batch.set(doc(db, "products", p.id), p));
        await batch.commit();
      } else if (!snapshot.empty) {
        setProducts(snapshot.docs.map((d) => d.data() as Product));
        setLoading(false);
      }
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.shippingFee !== undefined) setShippingFeeState(data.shippingFee);
        if (data.freeShippingThreshold !== undefined) setFreeShippingThresholdState(data.freeShippingThreshold);
      }
    }, () => {});
    return () => unsub();
  }, []);

  const addProduct = async (product: Product) => {
    await setDoc(doc(db, "products", product.id), product);
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    const current = products.find((p) => p.id === id);
    if (current) await setDoc(doc(db, "products", id), { ...current, ...changes });
  };

  const removeProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };

  const setShippingFee = async (fee: number) => {
    setShippingFeeState(fee);
    await setDoc(doc(db, "settings", "store"), { shippingFee: fee, freeShippingThreshold }, { merge: true });
  };

  const setFreeShippingThreshold = async (threshold: number) => {
    setFreeShippingThresholdState(threshold);
    await setDoc(doc(db, "settings", "store"), { shippingFee, freeShippingThreshold: threshold }, { merge: true });
  };

  const reduceStock = async (id: string, qty: number) => {
    const product = products.find((p) => p.id === id);
    if (product) await setDoc(doc(db, "products", id), { ...product, stock: Math.max(0, product.stock - qty) });
  };

  const value = useMemo(() => ({
    categories,
    products,
    featuredProducts: products.filter((p) => p.isBestseller),
    newProducts: products.filter((p) => p.isNew),
    shippingFee,
    freeShippingThreshold,
    loading,
    getProduct: (id: string) => products.find((p) => p.id === id),
    addProduct,
    updateProduct,
    removeProduct,
    addCategory: () => {},
    setShippingFee,
    setFreeShippingThreshold,
    reduceStock,
  }), [products, categories, shippingFee, freeShippingThreshold, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
