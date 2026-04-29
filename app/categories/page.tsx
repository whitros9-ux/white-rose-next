"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";

type SortOption = "default" | "price_asc" | "price_desc" | "rating";
type FilterState = { sort: SortOption; onlyNew: boolean; onlyBestseller: boolean; onlyDiscount: boolean };

function CategoriesContent() {
  const searchParams = useSearchParams();
  const { categories, products } = useStore();
  const [active, setActive] = useState(searchParams.get("cat") ?? "dresses");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ sort: "default", onlyNew: false, onlyBestseller: false, onlyDiscount: false });

  const activeFiltersCount = [filters.onlyNew, filters.onlyBestseller, filters.onlyDiscount, filters.sort !== "default"].filter(Boolean).length;

  const list = useMemo(() => {
    let base = products.filter((p) => p.category === active);
    if (query) base = base.filter((p) => p.name.includes(query));
    if (filters.onlyNew) base = base.filter((p) => p.isNew);
    if (filters.onlyBestseller) base = base.filter((p) => p.isBestseller);
    if (filters.onlyDiscount) base = base.filter((p) => p.oldPrice);
    if (filters.sort === "price_asc") base = [...base].sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") base = [...base].sort((a, b) => b.price - a.price);
    if (filters.sort === "rating") base = [...base].sort((a, b) => b.rating - a.rating);
    return base;
  }, [active, query, filters, products]);

  const resetFilters = () => setFilters({ sort: "default", onlyNew: false, onlyBestseller: false, onlyDiscount: false });

  return (
    <div className="bg-background min-h-screen pt-8">
      <h1 className="text-foreground text-2xl font-bold font-cairo px-5 mb-4 text-right">التسوق</h1>

      {/* Search + Filter */}
      <div className="flex gap-2 mx-5 mb-4">
        <button onClick={() => setShowFilters(!showFilters)}
          className={`relative w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors ${showFilters ? "bg-primary border-primary text-white" : "bg-card border-border text-foreground"}`}>
          <SlidersHorizontal size={17} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">{activeFiltersCount}</span>
          )}
        </button>
        <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 flex-row-reverse">
          <Search size={16} className="text-muted-fg flex-shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحثي عن منتج..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-fg text-sm font-cairo text-right outline-none" />
          {query && <button onClick={() => setQuery("")}><X size={14} className="text-muted-fg" /></button>}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mx-5 mb-4 bg-card border border-border rounded-2xl p-4">
          {/* Sort */}
          <p className="text-foreground text-xs font-bold font-cairo text-right mb-2">الترتيب</p>
          <div className="flex gap-2 flex-wrap justify-end mb-4">
            {[{ key: "default", label: "الافتراضي" }, { key: "price_asc", label: "السعر: الأقل" }, { key: "price_desc", label: "السعر: الأعلى" }, { key: "rating", label: "الأعلى تقييماً" }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilters((f) => ({ ...f, sort: key as SortOption }))}
                className={`px-3 py-1.5 rounded-full text-xs font-cairo border transition-colors ${filters.sort === key ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border"}`}>
                {label}
              </button>
            ))}
          </div>
          {/* Toggles */}
          <p className="text-foreground text-xs font-bold font-cairo text-right mb-2">تصفية</p>
          <div className="flex gap-2 flex-wrap justify-end">
            {[{ key: "onlyNew", label: "جديد" }, { key: "onlyBestseller", label: "الأكثر مبيعاً" }, { key: "onlyDiscount", label: "عروض" }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilters((f) => ({ ...f, [key]: !f[key as keyof FilterState] }))}
                className={`px-3 py-1.5 rounded-full text-xs font-cairo border transition-colors ${filters[key as keyof FilterState] ? "bg-primary text-white border-primary" : "bg-background text-foreground border-border"}`}>
                {label}
              </button>
            ))}
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} className="mt-3 text-primary text-xs font-cairo font-semibold w-full text-center">مسح الفلاتر</button>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-1 mb-4 scrollbar-hide" style={{ direction: "rtl" }}>
        {categories.map((cat) => {
          const selected = cat.id === active;
          return (
            <button key={cat.id} onClick={() => setActive(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold font-cairo border whitespace-nowrap transition-colors flex-shrink-0 ${selected ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border"}`}>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center pt-20 gap-3">
          <Search size={32} className="text-muted-fg" />
          <p className="text-muted-fg font-cairo">لا توجد نتائج مطابقة</p>
          {activeFiltersCount > 0 && <button onClick={resetFilters} className="text-primary text-sm font-cairo font-semibold">مسح الفلاتر</button>}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 px-3 pb-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return <Suspense><CategoriesContent /></Suspense>;
}
