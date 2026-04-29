"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { formatYER, formatUSD } from "@/lib/currency";

function CartRow({ item }: { item: CartItem }) {
  const { setQuantity, remove, getItemProduct } = useCart();
  const product = getItemProduct(item);
  if (!product) return null;

  return (
    <div className="flex flex-row-reverse gap-3 bg-card border border-border rounded-2xl p-3">
      <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        <Image src={product.image} alt={product.name} width={80} height={96} className="object-cover w-full h-full" />
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <p className="text-foreground text-sm font-semibold font-cairo text-right line-clamp-2">{product.name}</p>
        <p className="text-primary text-sm font-bold font-cairo text-right">{formatYER(product.price * item.quantity)}</p>
        <p className="text-muted-fg text-xs font-cairo text-right">{formatUSD(product.price * item.quantity)}</p>
        <div className="flex items-center justify-between flex-row-reverse mt-auto">
          <div className="flex items-center flex-row-reverse border border-border rounded-full bg-background px-1">
            <button onClick={() => setQuantity(product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center">
              <Minus size={13} className="text-foreground" />
            </button>
            <span className="min-w-[22px] text-center text-sm font-semibold font-cairo text-foreground">{item.quantity}</span>
            <button onClick={() => setQuantity(product.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center">
              <Plus size={13} className="text-foreground" />
            </button>
          </div>
          <button onClick={() => remove(product.id)}>
            <Trash2 size={17} className="text-muted-fg" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, shipping, total } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-8">
        <h1 className="text-foreground text-2xl font-bold font-cairo px-5 text-right mb-6">سلة التسوق</h1>
        <div className="flex flex-col items-center pt-16 gap-4 px-10">
          <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center">
            <ShoppingBag size={32} className="text-primary" />
          </div>
          <p className="text-foreground text-lg font-bold font-cairo text-center">سلتك فارغة</p>
          <p className="text-muted-fg text-sm font-cairo text-center">تصفحي مجموعتنا وأضيفي ما يعجبك</p>
          <Link href="/categories" className="mt-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold font-cairo">
            ابدئي التسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-8">
      <h1 className="text-foreground text-2xl font-bold font-cairo px-5 text-right mb-4">سلة التسوق</h1>

      <div className="px-5 flex flex-col gap-3 pb-64">
        {items.map((item) => <CartRow key={item.productId} item={item} />)}
      </div>

      {/* Summary */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-5 pt-4 pb-5 rounded-t-3xl">
        <div className="flex justify-between flex-row-reverse mb-2">
          <span className="text-muted-fg text-sm font-cairo">المجموع</span>
          <span className="text-foreground text-sm font-semibold font-cairo">{formatYER(subtotal)}</span>
        </div>
        <div className="flex justify-between flex-row-reverse mb-2">
          <span className="text-muted-fg text-sm font-cairo">الشحن</span>
          <span className="text-foreground text-sm font-semibold font-cairo">{shipping === 0 ? "مجاني" : formatYER(shipping)}</span>
        </div>
        <div className="border-t border-border my-2" />
        <div className="flex justify-between flex-row-reverse mb-4">
          <span className="text-foreground text-base font-bold font-cairo">الإجمالي</span>
          <div className="text-right">
            <p className="text-primary text-lg font-bold font-cairo">{formatYER(total)}</p>
            <p className="text-muted-fg text-xs font-cairo">{formatUSD(total)}</p>
          </div>
        </div>
        <button onClick={() => router.push("/checkout")}
          className="w-full py-4 bg-primary text-white rounded-3xl flex items-center justify-center gap-2 text-base font-bold font-cairo hover:bg-rose-dark transition-colors">
          إتمام الشراء
        </button>
      </div>
    </div>
  );
}
