import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/contexts/StoreContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SupportChatProvider } from "@/contexts/SupportChatContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "الوردة البيضاء",
  description: "متجر الوردة البيضاء للأزياء النسائية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
            <CurrencyProvider>
              <OrdersProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <SupportChatProvider>
                      <ToastProvider>
                        <main className="min-h-screen pb-24">
                          {children}
                        </main>
                        <BottomNav />
                      </ToastProvider>
                    </SupportChatProvider>
                  </CartProvider>
                </FavoritesProvider>
              </OrdersProvider>
            </CurrencyProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
