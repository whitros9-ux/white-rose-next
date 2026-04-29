"use client";
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Star, ShoppingBag, Check, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency, formatYER, formatUSD } from "@/lib/currency";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getProduct, products } = useStore();
  const product = getProduct(id);
  const { add, isInCart } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { currency } = useCurrency();

  const [size, setSize] = useState(product?.sizes?.[0]);
  const [color, setColor] = useState(product?.colors[0]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-fg font-cairo">المنتج غير موجود</p>
        <Link href="/" className="mt-4 text-primary font-cairo">العودة للرئيسية</Link>
      </div>
    );
  }

  const fav = isFavorite(product.id);
  const inCart = isInCart(product.id);
  const outOfStock = product.stock === 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  const shareOnWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${product.name} – ${formatCurrency(product.price, currency)}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Product Image */}
      <div className="relative w-full aspect-[3/4] bg-muted">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-32" />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 pt-10">
          <div className="flex gap-2">
            <button onClick={shareOnWhatsApp}
              className="w-10 h-10 rounded-full bg-card shadow flex items-center justify-center">
              <Share2 size={18} className="text-foreground" />
            </button>
            <button onClick={() => toggle(product.id)}
              className="w-10 h-10 rounded-full bg-card shadow flex items-center justify-center">
              <Heart size={20} className={fav ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card shadow flex items-center justify-center">
            <ArrowRight size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        {/* Title & Price */}
        <div className="flex justify-between items-start gap-4 flex-row-reverse mb-4">
          <div className="flex-1 text-right">
            <h1 className="text-foreground text-xl font-bold font-cairo">{product.name}</h1>
            <div className="flex items-center gap-1 mt-2 flex-row-reverse">
              <Star size={13} className="text-accent fill-accent" />
              <span className="text-foreground text-sm font-semibold font-cairo">{product.rating.toFixed(1)}</span>
              <span className="text-muted-fg text-xs font-cairo">({product.reviews} تقييم)</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-primary text-xl font-bold font-cairo">{formatCurrency(product.price, currency)}</p>
            <p className="text-foreground text-sm font-semibold font-cairo mt-1">{formatUSD(product.price)}</p>
            {product.oldPrice && (
              <p className="text-muted-fg text-xs line-through font-cairo mt-1">{formatCurrency(product.oldPrice, currency)}</p>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-cairo mb-4 ${outOfStock ? "bg-muted text-muted-fg" : product.stock <= 5 ? "bg-accent/10 text-accent" : "bg-green-50 text-green-600"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${outOfStock ? "bg-muted-fg" : product.stock <= 5 ? "bg-accent" : "bg-green-500"}`} />
          {outOfStock ? "نفذت الكمية" : product.stock <= 5 ? `متبقي ${product.stock} قطع فقط` : `متوفر في المخزون`}
        </div>

        {/* Description */}
        <h3 className="text-foreground text-sm font-bold font-cairo text-right mb-2">الوصف</h3>
        <p className="text-muted-fg text-sm font-cairo text-right leading-7 mb-4">{product.description}</p>

        {/* Colors */}
        <h3 className="text-foreground text-sm font-bold font-cairo text-right mb-3">اللون</h3>
        <div className="flex gap-2 flex-row-reverse mb-4">
          {product.colors.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${c === color ? "border-primary" : "border-transparent"}`}>
              <div className="w-7 h-7 rounded-full border border-border" style={{ backgroundColor: c }} />
            </button>
          ))}
        </div>

        {/* Sizes */}
        {product.sizes && (
          <>
            <h3 className="text-foreground text-sm font-bold font-cairo text-right mb-3">المقاس</h3>
            <div className="flex gap-2 flex-row-reverse flex-wrap mb-6">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`min-w-[48px] px-4 py-2.5 rounded-full border text-sm font-semibold font-cairo transition-colors ${
                    s === size ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border"
                  }`}>{s}</button>
              ))}
            </div>
          </>
        )}

        {/* Related */}
        {related.length > 0 && (
          <>
            <h3 className="text-foreground text-sm font-bold font-cairo text-right mt-4 mb-3">قد تعجبكِ أيضاً</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ direction: "rtl" }}>
              {related.map((p) => (
                <div key={p.id} className="min-w-[160px] max-w-[160px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add to Cart Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-5 py-3">
        <button
          onClick={() => add(product.id, { size, color })}
          className={`w-full py-4 rounded-3xl flex items-center justify-center gap-3 text-base font-bold font-cairo transition-colors ${
            inCart ? "bg-muted text-muted-fg" : "bg-primary text-white hover:bg-rose-dark"
          }`}
        >
          {inCart ? <Check size={18} /> : <ShoppingBag size={18} />}
          {inCart ? "تمت الإضافة للسلة" : "أضيفي إلى السلة"}
        </button>
      </div>
    </div>
  );
}
