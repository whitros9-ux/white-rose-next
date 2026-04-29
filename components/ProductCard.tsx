"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/constants/products";

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggle } = useFavorites();
  const { add, isInCart } = useCart();
  const { currency } = useCurrency();
  const { show } = useToast();
  const fav = isFavorite(product.id);
  const inCart = isInCart(product.id);
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    add(product.id, { color: product.colors[0], size: product.sizes?.[0] });
    if (!inCart) show("تمت الإضافة إلى السلة", "cart");
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    show(fav ? "تمت الإزالة من المفضلة" : "أُضيف إلى المفضلة", "favorite");
  };

  return (
    <div className="relative bg-card rounded-2xl border border-border overflow-hidden group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          {product.isNew && (
            <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full font-cairo">جديد</span>
          )}
          {product.oldPrice && (
            <span className="absolute top-2 left-8 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full font-cairo">خصم</span>
          )}
        </div>
        <div className="p-2">
          <p className="text-foreground text-xs font-semibold text-right truncate font-cairo leading-tight">{product.name}</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-accent fill-accent" />
              <span className="text-muted-fg text-[10px] font-cairo">{product.rating}</span>
            </div>
            <span className="text-primary text-xs font-bold font-cairo">{formatCurrency(product.price, currency)}</span>
          </div>
          {product.oldPrice && (
            <p className="text-muted-fg text-[10px] line-through text-right font-cairo">{formatCurrency(product.oldPrice, currency)}</p>
          )}
        </div>
      </Link>
      <button
        onClick={handleToggleFav}
        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
      >
        <Heart size={14} className={fav ? "fill-primary text-primary" : "text-muted-fg"} />
      </button>
      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className={`w-full py-2 text-xs font-bold font-cairo transition-colors ${outOfStock ? "bg-muted text-muted-fg cursor-not-allowed" : inCart ? "bg-muted text-muted-fg" : "bg-primary text-white hover:bg-rose-dark"}`}
      >
        {outOfStock ? "نفذت الكمية" : inCart ? "تمت الإضافة ✓" : "أضيفي للسلة"}
      </button>
    </div>
  );
}
