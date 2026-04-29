"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, HelpCircle, Info, ChevronLeft, Settings, Send, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSupportChat } from "@/contexts/SupportChatContext";
import type { Currency } from "@/lib/currency";

// ── Orders sub-screen ──
function OrdersScreen({ onBack }: { onBack: () => void }) {
  const { orders } = useOrders();
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const statusLabel: Record<string, string> = { pending: "قيد المعالجة", processing: "جاري التجهيز", shipped: "في الطريق", delivered: "تم التسليم" };
  const statusColor: Record<string, string> = { pending: "#8A6B73", processing: "#D4AF7A", shipped: "#C9385E", delivered: "#22c55e" };

  return (
    <div className="bg-background min-h-screen">
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-border flex-row-reverse">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center"><ArrowRight size={20} className="text-foreground" /></button>
        <h2 className="text-foreground text-lg font-bold font-cairo">طلباتي</h2>
        <div className="w-9" />
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-3 px-8">
          <div className="w-18 h-18 w-16 h-16 rounded-full bg-muted flex items-center justify-center"><Package size={32} className="text-primary" /></div>
          <p className="text-muted-fg text-base font-semibold font-cairo text-center">لا توجد طلبات بعد</p>
          <p className="text-muted-fg text-xs font-cairo text-center leading-6">ستظهر هنا جميع طلباتك بعد إتمام عملية الشراء الأولى.</p>
        </div>
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-muted-fg text-xs font-cairo">{order.orderId}</span>
                <span className="text-xs font-semibold font-cairo px-3 py-1 rounded-full bg-muted" style={{ color: statusColor[order.status] ?? "#8A6B73" }}>{statusLabel[order.status] ?? order.status}</span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between flex-row-reverse"><span className="text-muted-fg text-xs font-cairo">تاريخ الطلب</span><span className="text-foreground text-sm font-semibold font-cairo">{fmt(order.createdAt)}</span></div>
              <div className="flex justify-between flex-row-reverse"><span className="text-muted-fg text-xs font-cairo">التاريخ المتوقع للاستلام</span><span className="text-primary text-sm font-semibold font-cairo">{fmt(order.expectedDelivery)}</span></div>
              <div className="border-t border-border my-1" />
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between flex-row-reverse">
                  <p className="text-foreground text-sm font-cairo flex-1 text-right truncate">{item.name}</p>
                  <span className="text-muted-fg text-xs font-cairo mr-2">× {item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border my-1" />
              <div className="flex justify-between flex-row-reverse"><span className="text-muted-fg text-xs font-cairo">الإجمالي</span><span className="text-primary text-base font-bold font-cairo">{order.totals.totalYER}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Currency sub-screen ──
function CurrencyScreen({ onBack }: { onBack: () => void }) {
  const { currency, setCurrency } = useCurrency();
  const options: { value: Currency; label: string; symbol: string; desc: string }[] = [
    { value: "YER", label: "الريال اليمني", symbol: "ر.ي", desc: "العملة الافتراضية" },
    { value: "SAR", label: "الريال السعودي", symbol: "ر.س", desc: "1 دولار = 3.75 ر.س" },
    { value: "USD", label: "الدولار الأمريكي", symbol: "$", desc: "السعر الأصلي" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-border flex-row-reverse">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center"><ArrowRight size={20} className="text-foreground" /></button>
        <h2 className="text-foreground text-lg font-bold font-cairo">العملة</h2>
        <div className="w-9" />
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        {options.map((opt) => {
          const selected = opt.value === currency;
          return (
            <button key={opt.value} onClick={() => setCurrency(opt.value)}
              className={`flex items-center flex-row-reverse gap-3 p-4 rounded-2xl border transition-colors ${selected ? "bg-primary border-primary" : "bg-card border-border"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selected ? "bg-white/20" : "bg-muted"}`}>
                <span className={`text-sm font-bold font-cairo ${selected ? "text-white" : "text-primary"}`}>{opt.symbol}</span>
              </div>
              <div className="flex-1 text-right">
                <p className={`text-sm font-semibold font-cairo ${selected ? "text-white" : "text-foreground"}`}>{opt.label}</p>
                <p className={`text-xs font-cairo mt-0.5 ${selected ? "text-white/80" : "text-muted-fg"}`}>{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Support sub-screen ──
function SupportScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const { messages, sendMessage } = useSupportChat();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  const handleSend = () => {
    if (!text.trim() || !user) return;
    sendMessage(text.trim());
    setText("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-border flex-row-reverse">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center"><ArrowRight size={20} className="text-foreground" /></button>
        <h2 className="text-foreground text-lg font-bold font-cairo">المساعدة والدعم</h2>
        <div className="w-9" />
      </div>

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <p className="text-foreground text-base font-bold font-cairo">يجب تسجيل الدخول أولاً</p>
          <p className="text-muted-fg text-sm font-cairo leading-7">لإرسال رسالة لخدمة العملاء يرجى تسجيل الدخول إلى حسابك.</p>
          <button onClick={() => { onBack(); router.push("/login"); }}
            className="mt-2 bg-primary text-white px-8 py-3 rounded-3xl text-sm font-bold font-cairo hover:bg-rose-dark transition-colors">
            تسجيل الدخول
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 pb-28">
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-10 gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"><HelpCircle size={28} className="text-primary" /></div>
                <p className="text-muted-fg text-sm font-cairo text-center">أرسلي رسالتك وسنرد عليكِ في أقرب وقت</p>
              </div>
            )}
            {messages.map((msg) => {
              const mine = msg.sender === "customer";
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${mine ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
                    {!mine && <p className="text-muted-fg text-xs font-cairo mb-1">الوردة البيضاء</p>}
                    <p className="text-sm font-cairo text-right">{msg.text}</p>
                    <p className={`text-[10px] font-cairo mt-1 text-left ${mine ? "text-white/70" : "text-muted-fg"}`}>{fmt(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="fixed bottom-20 left-0 right-0 flex items-end gap-2 px-4 py-3 border-t border-border bg-background flex-row-reverse">
            <button onClick={handleSend} className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${text.trim() ? "bg-primary" : "bg-muted"}`}>
              <Send size={16} className={text.trim() ? "text-white" : "text-muted-fg"} />
            </button>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتبي رسالتك..." rows={1}
              className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-sm font-cairo text-foreground bg-card text-right outline-none resize-none max-h-28 placeholder:text-muted-fg" />
          </div>
        </>
      )}
    </div>
  );
}

// ── About sub-screen ──
function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-background min-h-screen">
      <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b border-border flex-row-reverse">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center"><ArrowRight size={20} className="text-foreground" /></button>
        <h2 className="text-foreground text-lg font-bold font-cairo">عن الوردة البيضاء</h2>
        <div className="w-9" />
      </div>
      <div className="flex flex-col items-center pt-6 pb-5">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4"><ShoppingBag size={40} className="text-primary" /></div>
        <h3 className="text-foreground text-xl font-bold font-cairo">الوردة البيضاء</h3>
        <p className="text-muted-fg text-xs font-cairo mt-1">الإصدار 1.0.0</p>
      </div>
      <div className="mx-4 bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        {["الوردة البيضاء متجر يمني متخصص في الأزياء النسائية وملابس الأطفال، يقدم أرقى التصاميم وأجمل القطع التي تلائم ذوق المرأة اليمنية الأصيلة.",
          "نؤمن بأن كل امرأة تستحق أن تشعر بالجمال والثقة، لذلك نختار بعناية كل قطعة تصل إليكِ لتكوني دائماً في أبهى صورة — سواء في أيام العيد أو المناسبات أو حتى يومياتك الجميلة.",
          "لأطفالكِ الصغار، نوفر ملابس مريحة وألوانها تعكس بهجتهم وبراءتهم، بجودة تدوم وأسعار تناسب الجميع.",
          "نفخر بخدمة عملائنا في اليمن الحبيب، ونسعى دائماً لنقدم تجربة تسوق سهلة وممتعة توصل إليكِ كل ما تحبين حتى باب منزلكِ.",
        ].map((t, i) => <p key={i} className="text-foreground text-sm font-cairo text-right leading-7">{t}</p>)}
      </div>
    </div>
  );
}

// ── Main Profile Screen ──
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { orders } = useOrders();
  const [screen, setScreen] = useState<"orders" | "support" | "about" | "currency" | null>(null);

  if (screen === "orders") return <OrdersScreen onBack={() => setScreen(null)} />;
  if (screen === "support") return <SupportScreen onBack={() => setScreen(null)} />;
  if (screen === "about") return <AboutScreen onBack={() => setScreen(null)} />;
  if (screen === "currency") return <CurrencyScreen onBack={() => setScreen(null)} />;

  const sections = [
    { title: "حسابي", items: [{ icon: Package, label: "طلباتي", action: () => setScreen("orders") }] },
    { title: "التطبيق", items: [
      { icon: DollarSign, label: "العملة", action: () => setScreen("currency") },
      { icon: HelpCircle, label: "المساعدة والدعم", action: () => setScreen("support") },
      { icon: Info, label: "عن الوردة البيضاء", action: () => setScreen("about") },
    ]},
    ...(user?.role === "admin" ? [{ title: "الإدارة", items: [{ icon: Settings, label: "إدارة المتجر", action: () => router.push("/admin") }] }] : []),
  ];

  return (
    <div className="bg-background min-h-screen pt-8 pb-8">
      <h1 className="text-foreground text-2xl font-bold font-cairo px-5 text-right mb-4">حسابي</h1>

      {/* User Card */}
      <div className="mx-5 flex items-center gap-3 bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold font-cairo">{user ? user.name.charAt(0) : "و"}</span>
        </div>
        <div className="flex-1 text-right">
          <p className="text-foreground text-base font-bold font-cairo">{user ? user.name : "أهلاً بكِ"}</p>
          {user ? (
            <>
              {user.role === "admin" && <p className="text-primary text-xs font-semibold font-cairo">مدير المتجر</p>}
              <p className="text-muted-fg text-xs font-cairo mt-0.5">{user.email}</p>
            </>
          ) : (
            <p className="text-muted-fg text-xs font-cairo">سجلي دخولكِ لعرض بياناتك</p>
          )}
        </div>
        {user ? (
          <button onClick={logout} className="border border-primary text-primary px-4 py-2.5 rounded-2xl text-sm font-semibold font-cairo flex-shrink-0">خروج</button>
        ) : (
          <button onClick={() => router.push("/login")} className="bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-semibold font-cairo flex-shrink-0">دخول</button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-3 px-5 mb-6 flex-row-reverse">
        {[{ label: "طلبات", value: orders.length }, { label: "مفضلة", value: favorites.length }, { label: "نقاط", value: "٢٥٠" }].map((s) => (
          <div key={s.label} className="flex-1 bg-card border border-border rounded-2xl py-4 flex flex-col items-center gap-1">
            <span className="text-foreground text-lg font-bold font-cairo">{s.value}</span>
            <span className="text-muted-fg text-xs font-cairo">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Menu Sections */}
      {sections.map((section) => (
        <div key={section.title} className="mx-5 mb-5">
          <p className="text-muted-fg text-xs font-semibold font-cairo text-right mb-2 px-1">{section.title}</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {section.items.map((item, idx) => (
              <button key={item.label} onClick={item.action}
                className={`w-full flex items-center flex-row-reverse gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${idx < section.items.length - 1 ? "border-b border-border" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <item.icon size={15} className="text-primary" />
                </div>
                <span className="flex-1 text-foreground text-sm font-medium font-cairo text-right">{item.label}</span>
                <ChevronLeft size={15} className="text-muted-fg" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-muted-fg text-xs font-cairo text-center mt-4">الإصدار 1.0.0</p>
    </div>
  );
}
