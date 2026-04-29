"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !phone.trim()) {
      setError("يرجى إدخال البريد الإلكتروني ورقم الجوال");
      return;
    }
    login(email, phone);
    router.push("/profile");
  };

  const inputClass = "w-full bg-card border border-border rounded-2xl px-4 py-4 text-sm font-cairo text-foreground text-right outline-none focus:border-primary placeholder:text-muted-fg";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
        <ShoppingBag size={36} className="text-primary" />
      </div>
      <h1 className="text-foreground text-2xl font-bold font-cairo mb-1">الوردة البيضاء</h1>
      <p className="text-muted-fg text-sm font-cairo mb-8">سجلي دخولكِ للمتابعة</p>

      <div className="w-full flex flex-col gap-3">
        <div>
          <label className="text-muted-fg text-xs font-cairo block text-right mb-1.5">البريد الإلكتروني</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" type="email" className={inputClass} />
        </div>
        <div>
          <label className="text-muted-fg text-xs font-cairo block text-right mb-1.5">رقم الجوال</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="7xxxxxxxx" type="tel" className={inputClass} />
        </div>
        {error && <p className="text-primary text-xs font-cairo text-right">{error}</p>}
        <button onClick={handleLogin} className="w-full py-4 bg-primary text-white rounded-3xl text-base font-bold font-cairo mt-2 hover:bg-rose-dark transition-colors">
          دخول
        </button>
      </div>
    </div>
  );
}
