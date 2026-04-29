"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const TABS = [
  { href: "/", icon: Home, label: "الرئيسية" },
  { href: "/categories", icon: Grid3X3, label: "التسوق" },
  { href: "/favorites", icon: Heart, label: "المفضلة" },
  { href: "/cart", icon: ShoppingBag, label: "السلة" },
  { href: "/profile", icon: User, label: "حسابي" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border h-20 flex items-center justify-around px-2">
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${active ? "text-primary" : "text-muted-fg"}`}>
            <div className="relative">
              <Icon size={22} className={active ? "stroke-primary" : "stroke-muted-fg"} />
              {href === "/cart" && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 font-cairo">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-cairo font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
