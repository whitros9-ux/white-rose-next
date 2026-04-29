"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { products } = useStore();
  const { currency } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length > 0
    ? products.filter((p) => p.name.includes(query) || p.description.includes(query)).slice(0, 8)
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-background rounded-b-3xl shadow-xl mx-0 pt-safe" onClick={(e) => e.stopPropagation()}>
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border flex-row-reverse">
          <Search size={18} className="text-muted-fg flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن منتج..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-fg text-base font-cairo text-right outline-none"
          />
          <button onClick={onClose} className="flex-shrink-0">
            <X size={20} className="text-muted-fg" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted transition-colors flex-row-reverse">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image src={p.image} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-foreground text-sm font-semibold font-cairo">{p.name}</p>
                  <p className="text-primary text-sm font-bold font-cairo mt-0.5">{formatCurrency(p.price, currency)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : query.trim().length > 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-fg font-cairo text-sm">لا توجد نتائج لـ "{query}"</p>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-fg font-cairo text-sm">اكتبي اسم المنتج للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
