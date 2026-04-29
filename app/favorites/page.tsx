"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useStore } from "@/contexts/StoreContext";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { products } = useStore();
  const items = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="bg-background min-h-screen pt-8">
      <h1 className="text-foreground text-2xl font-bold font-cairo px-5 text-right">المفضلة</h1>
      <p className="text-muted-fg text-sm font-cairo px-5 mt-1 mb-5 text-right">
        {items.length > 0 ? `${items.length} قطعة محفوظة` : "ابدئي بحفظ القطع التي تعجبك"}
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-4 px-10">
          <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center">
            <Heart size={32} className="text-primary" />
          </div>
          <p className="text-foreground text-lg font-bold font-cairo text-center">لا توجد قطع في المفضلة</p>
          <p className="text-muted-fg text-sm font-cairo text-center">اضغطي على القلب لحفظ القطع التي تعجبك</p>
          <Link href="/categories" className="mt-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold font-cairo">
            ابدئي التسوق
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 px-3">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
