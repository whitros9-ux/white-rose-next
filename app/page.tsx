"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Truck, Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SearchModal } from "@/components/SearchModal";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currency";

export default function HomePage() {
  const { categories, featuredProducts, newProducts, products, freeShippingThreshold } = useStore();
  const { currency } = useCurrency();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <div className="text-right">
          <p className="text-muted-fg text-xs font-cairo">أهلاً بكِ في</p>
          <h1 className="text-foreground text-2xl font-bold font-cairo">الوردة البيضاء</h1>
        </div>
        <button onClick={() => setSearchOpen(true)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
          <Search size={18} className="text-foreground" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="mx-5 rounded-3xl overflow-hidden h-52 relative mb-7">
        <Image src="/images/hero-banner.png" alt="hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(122,43,64,0.85)] to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-5 text-right">
          <p className="text-white/80 text-xs font-cairo">تشكيلة الربيع ٢٠٢٦</p>
          <h2 className="text-white text-2xl font-bold font-cairo mt-1">أناقتكِ تستحق الأفضل</h2>
          <Link href="/categories"
            className="inline-flex items-center gap-2 mt-3 bg-white text-foreground px-4 py-2 rounded-full text-sm font-semibold font-cairo hover:bg-cream transition-colors">
            تسوقي الآن <ArrowLeft size={15} />
          </Link>
        </div>
      </div>

      {/* Categories */}
      <h3 className="text-foreground font-bold font-cairo text-base px-5 mb-3 text-right">تسوقي حسب القسم</h3>
      <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: "rtl" }}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories?cat=${cat.id}`} className="flex flex-col items-center gap-2 min-w-[72px] flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-muted">
              <Image src={cat.image} alt={cat.name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
            <span className="text-foreground text-xs font-cairo font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* Bestsellers */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <div className="text-right">
            <h3 className="text-foreground font-bold font-cairo text-base">الأكثر مبيعاً</h3>
            <p className="text-muted-fg text-xs font-cairo">القطع التي أحبتها عميلاتنا</p>
          </div>
          <Link href="/categories" className="text-primary text-xs font-cairo font-semibold">عرض الكل</Link>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: "rtl" }}>
          {featuredProducts.map((p) => (
            <div key={p.id} className="min-w-[180px] max-w-[180px] flex-shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Promo */}
      <div className="mx-5 mt-6 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #F8D7DF, #FFF8F5)" }}>
        <div className="flex items-center justify-between p-4 gap-3">
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-sm flex-shrink-0">
            <Truck size={26} className="text-primary" />
          </div>
          <div className="text-right flex-1">
            <p className="text-primary text-xs font-semibold font-cairo">عرض حصري</p>
            <p className="text-foreground text-lg font-bold font-cairo">شحن مجاني</p>
            <p className="text-muted-fg text-xs font-cairo">لجميع الطلبات فوق {formatCurrency(freeShippingThreshold, currency)}</p>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="mt-6 pb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="text-foreground font-bold font-cairo text-base">وصل حديثاً</h3>
          <Link href="/categories" className="text-primary text-xs font-cairo font-semibold">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-4 gap-2 px-3">
          {[...newProducts, ...products.slice(0, 4)].slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
