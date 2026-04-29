"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2, Save, Package, Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useOrders } from "@/contexts/OrdersContext";
import type { Product, CategoryId } from "@/constants/products";
import { formatYER } from "@/lib/currency";
import type { ChatMessage } from "@/app/api/chat/route";

const inputClass = "w-full bg-background border border-border rounded-xl px-3 py-3 text-sm font-cairo text-foreground text-right outline-none focus:border-primary placeholder:text-muted-fg";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories, products, addProduct, updateProduct, removeProduct, shippingFee, freeShippingThreshold, setShippingFee, setFreeShippingThreshold } = useStore();
  const { orders } = useOrders();

  const [tab, setTab] = useState<"products" | "orders" | "shipping" | "chat">("products");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("dresses");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("4.5");
  const [reviews, setReviews] = useState("0");
  const [colorsList, setColorsList] = useState<string[]>(["#C9385E", "#FFFFFF"]);
  const [stockInput, setStockInput] = useState("10");
  const [sizesInput, setSizesInput] = useState("S, M, L");
  const [isNew, setIsNew] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shippingFeeInput, setShippingFeeInput] = useState(String(shippingFee));
  const [thresholdInput, setThresholdInput] = useState(String(freeShippingThreshold));
  const [shippingMsg, setShippingMsg] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [replySending, setReplySending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMsgCountRef = useRef(0);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch("/api/chat?admin=1");
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          const customerMsgs = data.filter((m) => m.sender === "customer").length;
          if (customerMsgs > prevMsgCountRef.current) playSound();
          prevMsgCountRef.current = customerMsgs;
          setChatMessages(data);
        }
      } catch {}
    };
    fetchChat();
    chatPollRef.current = setInterval(fetchChat, 4000);
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, []);

  useEffect(() => {
    if (selectedSession) setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [chatMessages, selectedSession]);

  const sessions = Array.from(new Set(chatMessages.map((m) => m.sessionId)));
  const getSessionMessages = (sid: string) => chatMessages.filter((m) => m.sessionId === sid);
  const getLastMessage = (sid: string) => {
    const msgs = getSessionMessages(sid);
    return msgs[msgs.length - 1];
  };
  const getCustomerInfo = (sid: string) => {
    const msgs = getSessionMessages(sid);
    return msgs.find((m) => m.sender === "customer" && m.customerInfo)?.customerInfo ?? null;
  };
  const getUnreplied = (sid: string) => {
    const msgs = getSessionMessages(sid);
    if (msgs.length === 0) return false;
    return msgs[msgs.length - 1].sender === "customer";
  };

  const handleReply = async () => {
    if (!replyInput.trim() || !selectedSession || replySending) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: replyInput.trim(), sender: "support", sessionId: selectedSession }),
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages((prev) => [...prev, msg]);
        setReplyInput("");
      }
    } catch {}
    setReplySending(false);
  };

  const handleClearChat = async () => {
    await fetch("/api/chat", { method: "DELETE" });
    setChatMessages([]);
    setSelectedSession(null);
  };

  const fmtTime = (ts: string) => new Date(ts).toLocaleString("ar-SA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground font-bold font-cairo">غير مصرح لك بالدخول</p>
        <button onClick={() => router.push("/")} className="text-primary font-cairo text-sm">العودة للرئيسية</button>
      </div>
    );
  }

  const resetForm = () => { setName(""); setPrice(""); setOldPrice(""); setDescription(""); setRating("4.5"); setReviews("0"); setColorsList(["#C9385E", "#FFFFFF"]); setSizesInput("S, M, L"); setIsNew(true); setIsBestseller(false); setEditingId(null); setStockInput("10"); };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !description.trim()) { setMessage("يرجى تعبئة الحقول المطلوبة"); return; }
    const colors = colorsList.filter(Boolean);
    const sizes = sizesInput.trim() ? sizesInput.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    const productData: Omit<Product, "id"> = {
      name: name.trim(), price: Number(price), oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category, description: description.trim(), rating: Number(rating), reviews: Number(reviews),
      colors, sizes, isNew, isBestseller, stock: Math.max(0, Number(stockInput) || 0), image: `/images/product-${category === "abayas" ? "abaya" : category === "perfumes" ? "perfume" : category === "bags" ? "bag" : category === "jewelry" ? "jewelry" : "dress"}.png`,
    };
    try {
      if (editingId) { await updateProduct(editingId, productData); setMessage("تم تحديث المنتج"); }
      else { await addProduct({ ...productData, id: `p-${Date.now()}` }); setMessage("تمت إضافة المنتج"); }
      resetForm();
      setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("حدث خطأ، حاول مرة أخرى"); }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id); setName(p.name); setCategory(p.category); setPrice(String(p.price));
    setOldPrice(p.oldPrice ? String(p.oldPrice) : ""); setDescription(p.description);
    setRating(String(p.rating)); setReviews(String(p.reviews));
    setColorsList(p.colors); setSizesInput((p.sizes ?? []).join(", ")); setStockInput(String(p.stock ?? 0));
    setIsNew(!!p.isNew); setIsBestseller(!!p.isBestseller); setTab("products");
  };

  const handleSaveShipping = async () => {
    const fee = Number(shippingFeeInput); const threshold = Number(thresholdInput);
    if (!Number.isFinite(fee) || fee < 0 || !Number.isFinite(threshold) || threshold <= 0) { setShippingMsg("يرجى إدخال أرقام صحيحة"); return; }
    try {
      await setShippingFee(fee); await setFreeShippingThreshold(threshold);
      setShippingMsg("تم حفظ إعدادات الشحن"); setTimeout(() => setShippingMsg(""), 3000);
    } catch { setShippingMsg("حدث خطأ في الحفظ"); }
  };

  const TABS = [{ key: "products", label: "المنتجات" }, { key: "orders", label: "الطلبات" }, { key: "shipping", label: "الشحن" }, { key: "chat", label: "الدردشة" }] as const;

  return (
    <div className="bg-background min-h-screen pt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-5 flex-row-reverse">
        <button onClick={() => router.push("/profile")} className="w-9 h-9 flex items-center justify-center"><ArrowRight size={20} className="text-foreground" /></button>
        <h1 className="text-foreground text-xl font-bold font-cairo">لوحة الإدارة</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-5 overflow-x-auto scrollbar-hide" style={{ direction: "rtl" }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded-full text-sm font-semibold font-cairo border transition-colors flex-shrink-0 ${tab === key ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div className="px-5 pb-10">
          <div className="bg-card border border-border rounded-2xl p-4 mb-5">
            <h2 className="text-foreground text-base font-bold font-cairo text-right mb-4">{editingId ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "اسم المنتج *", val: name, set: setName, placeholder: "اسم المنتج" },
                { label: "السعر (دولار) *", val: price, set: setPrice, placeholder: "مثال: 99" },
                { label: "السعر القديم (دولار)", val: oldPrice, set: setOldPrice, placeholder: "اختياري" },
                { label: "التقييم", val: rating, set: setRating, placeholder: "4.5" },
                { label: "عدد التقييمات", val: reviews, set: setReviews, placeholder: "0" },
                { label: "المخزون (عدد القطع) *", val: stockInput, set: setStockInput, placeholder: "10" },
                { label: "المقاسات (مفصولة بفاصلة)", val: sizesInput, set: setSizesInput, placeholder: "S, M, L" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="text-muted-fg text-xs font-cairo block text-right mb-1">{label}</label>
                  <input value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputClass} />
                </div>
              ))}

              {/* Color Picker */}
              <div>
                <label className="text-muted-fg text-xs font-cairo block text-right mb-2">الألوان</label>
                <div className="flex gap-2 flex-wrap flex-row-reverse items-center">
                  {colorsList.map((color, idx) => (
                    <div key={idx} className="relative group">
                      <label className="cursor-pointer block">
                        <div className="w-10 h-10 rounded-full border-2 border-border shadow-sm group-hover:border-primary transition-colors"
                          style={{ backgroundColor: color }} />
                        <input type="color" value={color}
                          onChange={(e) => setColorsList((prev) => prev.map((c, i) => i === idx ? e.target.value : c))}
                          className="sr-only" />
                      </label>
                      {colorsList.length > 1 && (
                        <button onClick={() => setColorsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <label className="cursor-pointer w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors">
                    <span className="text-muted-fg text-lg leading-none">+</span>
                    <input type="color" defaultValue="#C9385E"
                      onChange={(e) => setColorsList((prev) => [...prev, e.target.value])}
                      className="sr-only" />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-muted-fg text-xs font-cairo block text-right mb-1">القسم</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={inputClass}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-muted-fg text-xs font-cairo block text-right mb-1">الوصف *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المنتج" rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div className="flex gap-4 flex-row-reverse">
                <label className="flex items-center gap-2 flex-row-reverse cursor-pointer">
                  <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="accent-primary" />
                  <span className="text-foreground text-sm font-cairo">جديد</span>
                </label>
                <label className="flex items-center gap-2 flex-row-reverse cursor-pointer">
                  <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} className="accent-primary" />
                  <span className="text-foreground text-sm font-cairo">الأكثر مبيعاً</span>
                </label>
              </div>
              {message && <p className="text-primary text-sm font-cairo text-right">{message}</p>}
              <div className="flex gap-2 flex-row-reverse">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl text-sm font-bold font-cairo">
                  <Save size={16} /> {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
                </button>
                {editingId && <button onClick={resetForm} className="px-4 py-3 bg-muted text-foreground rounded-2xl text-sm font-cairo">إلغاء</button>}
              </div>
            </div>
          </div>

          <h2 className="text-foreground text-base font-bold font-cairo text-right mb-3">المنتجات ({products.length})</h2>
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between flex-row-reverse gap-3">
                <div className="flex-1 text-right">
                  <p className="text-foreground text-sm font-semibold font-cairo">{p.name}</p>
                  <p className="text-muted-fg text-xs font-cairo">{formatYER(p.price)} · {categories.find((c) => c.id === p.category)?.name}</p>
                  <p className={`text-xs font-semibold font-cairo mt-0.5 ${p.stock === 0 ? "text-primary" : p.stock <= 5 ? "text-accent" : "text-green-600"}`}>
                    {p.stock === 0 ? "نفذت الكمية" : p.stock <= 5 ? `متبقي ${p.stock} فقط` : `${p.stock} في المخزون`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus size={14} className="text-primary" /></button>
                  <button onClick={() => removeProduct(p.id)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Trash2 size={14} className="text-muted-fg" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="px-5 pb-10">
          <h2 className="text-foreground text-base font-bold font-cairo text-right mb-3">الطلبات ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Package size={40} className="text-muted-fg" />
              <p className="text-muted-fg font-cairo">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex justify-between flex-row-reverse mb-2">
                    <span className="text-muted-fg text-xs font-cairo">{order.orderId}</span>
                    <span className="text-primary text-base font-bold font-cairo">{order.totals.totalYER}</span>
                  </div>
                  <p className="text-foreground text-sm font-semibold font-cairo text-right mb-1">{order.customer.name} · {order.customer.phone}</p>
                  <p className="text-muted-fg text-xs font-cairo text-right">{order.customer.city} · {order.paymentMethodLabel}</p>
                  <div className="mt-2 border-t border-border pt-2">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-muted-fg text-xs font-cairo text-right">{item.name} × {item.quantity}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="px-5 pb-10">
          <div className="flex items-center justify-between mb-3">
            <button onClick={handleClearChat} className="flex items-center gap-1.5 text-muted-fg text-xs font-cairo hover:text-primary transition-colors">
              <Trash2 size={13} /> مسح الكل
            </button>
            <h2 className="text-foreground text-base font-bold font-cairo text-right">المحادثات ({sessions.length})</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <MessageCircle size={40} className="text-muted-fg" />
              <p className="text-muted-fg font-cairo text-sm">لا توجد محادثات بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Session List */}
              {!selectedSession && sessions.map((sid, idx) => {
                const last = getLastMessage(sid);
                const unreplied = getUnreplied(sid);
                const info = getCustomerInfo(sid);
                return (
                  <button key={sid} onClick={() => setSelectedSession(sid)}
                    className="bg-card border border-border rounded-2xl p-4 text-right flex items-center gap-3 flex-row-reverse hover:border-primary transition-colors w-full">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${unreplied ? "bg-primary" : "bg-muted"}`}>
                      <MessageCircle size={18} className={unreplied ? "text-white" : "text-muted-fg"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-row-reverse mb-0.5">
                        <p className="text-foreground text-sm font-bold font-cairo">{info?.name ?? `محادثة #${idx + 1}`}</p>
                        {unreplied && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-cairo flex-shrink-0">يحتاج رد</span>}
                      </div>
                      {info && (
                        <div className="flex flex-col gap-0.5 mb-1">
                          <p className="text-muted-fg text-xs font-cairo">{info.email}</p>
                          <p className="text-primary text-xs font-semibold font-cairo">{info.phone}</p>
                        </div>
                      )}
                      <p className="text-muted-fg text-xs font-cairo truncate">{last?.text}</p>
                      <p className="text-muted-fg text-[10px] font-cairo mt-0.5">{last ? fmtTime(last.timestamp) : ""}</p>
                    </div>
                  </button>
                );
              })}

              {/* Conversation View */}
              {selectedSession && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Conv Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-primary flex-row-reverse">
                    <div className="text-right">
                      <p className="text-white text-sm font-bold font-cairo">
                        {getCustomerInfo(selectedSession)?.name ?? `محادثة #${sessions.indexOf(selectedSession) + 1}`}
                      </p>
                      {getCustomerInfo(selectedSession) && (
                        <p className="text-white/75 text-xs font-cairo">
                          {getCustomerInfo(selectedSession)!.phone} · {getCustomerInfo(selectedSession)!.email}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setSelectedSession(null)} className="flex items-center gap-1.5 text-white/80 text-xs font-cairo flex-shrink-0">
                      <ArrowRight size={14} /> رجوع
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="p-4 flex flex-col gap-3 max-h-[50vh] overflow-y-auto" style={{ direction: "rtl" }}>
                    {getSessionMessages(selectedSession).map((msg) => {
                      const isCustomer = msg.sender === "customer";
                      return (
                        <div key={msg.id} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm font-cairo leading-6 ${
                            isCustomer ? "bg-muted text-foreground rounded-tr-sm" : "bg-primary text-white rounded-tl-sm"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-muted-fg text-[10px] font-cairo mt-1 px-1">
                            {isCustomer ? "العميل" : "أنتِ"} · {fmtTime(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-border p-3 flex gap-2 flex-row-reverse">
                    <input
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                      placeholder="اكتبي ردّك..."
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-cairo text-foreground text-right outline-none focus:border-primary placeholder:text-muted-fg"
                    />
                    <button onClick={handleReply} disabled={!replyInput.trim() || replySending}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity">
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shipping Tab */}
      {tab === "shipping" && (
        <div className="px-5 pb-10">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-foreground text-base font-bold font-cairo text-right mb-4">إعدادات الشحن</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-muted-fg text-xs font-cairo block text-right mb-1">رسوم الشحن (دولار)</label>
                <input value={shippingFeeInput} onChange={(e) => setShippingFeeInput(e.target.value)} placeholder="25" className={inputClass} />
              </div>
              <div>
                <label className="text-muted-fg text-xs font-cairo block text-right mb-1">حد الشحن المجاني (دولار)</label>
                <input value={thresholdInput} onChange={(e) => setThresholdInput(e.target.value)} placeholder="500" className={inputClass} />
              </div>
              {shippingMsg && <p className="text-primary text-sm font-cairo text-right">{shippingMsg}</p>}
              <button onClick={handleSaveShipping} className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl text-sm font-bold font-cairo">
                <Save size={16} /> حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
