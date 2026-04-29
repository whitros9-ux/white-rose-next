"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { ShoppingBag, Heart, Check, X } from "lucide-react";

type ToastType = "cart" | "favorite" | "success" | "error";
type Toast = { id: number; message: string; type: ToastType };
type ToastContextValue = { show: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = { cart: ShoppingBag, favorite: Heart, success: Check, error: X };
  const Icon = icons[toast.type];
  const colors = {
    cart: "bg-primary text-white",
    favorite: "bg-primary text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg font-cairo text-sm font-semibold animate-in ${colors[toast.type]}`}
      style={{ animation: "slideUp 0.3s ease" }}>
      <Icon size={16} />
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "cart") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
