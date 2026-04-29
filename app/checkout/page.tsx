"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Package, Smartphone, DollarSign, Tag, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrdersContext";
import { formatYER, formatUSD } from "@/lib/currency";

type PayMethod = "cod" | "jeeb" | "mahfathi";
const PAY_OPTIONS = [
  { key: "cod" as PayMethod, label: "الدفع عند الاستلام", icon: Package },
  { key: "jeeb" as PayMethod, label: "محفظة جيب", icon: Smartphone },
  { key: "mahfathi" as PayMethod, label: "محفظتي", icon: DollarSign },
];
const PAY_LABEL: Record<PayMethod, string> = { cod: "الدفع عند الاستلام", jeeb: "محفظة جيب", mahfathi: "محفظتي" };

const COUPONS: Record<string, number> = {
  "ROSE10": 0.10,
  "WELCOME20": 0.20,
  "VIP30": 0.30,
};

function getDeliveryEstimate() {
  const from = new Date(); from.setDate(from.getDate() + 3);
  const to = new Date(); to.setDate(to.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clear, getItemProduct } = useCart();
  const { addOrder } = useOrders();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pay, setPay] = useState<PayMethod>("cod");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState("");

  const discountAmount = subtotal * couponDiscount;
  const finalTotal = total - discountAmount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (couponApplied === code) { setCouponMsg("الكوبون مفعّل بالفعل"); return; }
    const discount = COUPONS[code];
    if (discount) {
      setCouponDiscount(discount);
      setCouponApplied(code);
      setCouponMsg(`✓ تم تطبيق خصم ${discount * 100}%`);
    } else {
      setCouponMsg("كوبون غير صحيح");
      setCouponDiscount(0);
      setCouponApplied("");
    }
  };

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 8 && address.trim().length > 3 && city.trim().length > 1 && items.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const orderItems = items.map((item) => {
      const product = getItemProduct(item);
      if (!product) return null;
      return { id: product.id, name: product.name, quantity: item.quantity, size: item.size || null, color: item.color || null, unitPriceUsd: product.price, lineTotalUsd: product.price * item.quantity };
    }).filter(Boolean) as any[];

    const payload = {
      orderId: `WR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: { name: name.trim(), phone: phone.trim(), email: user?.email || null, city: city.trim(), address: address.trim() },
      paymentMethod: pay,
      paymentMethodLabel: PAY_LABEL[pay],
      coupon: couponApplied || null,
      discountPercent: couponDiscount * 100 || null,
      items: orderItems,
      totals: { subtotalYER: formatYER(subtotal), shippingYER: shipping === 0 ? "مجاني" : formatYER(shipping), discountYER: discountAmount > 0 ? formatYER(discountAmount) : null, totalYER: formatYER(finalTotal) },
    };

    addOrder({ ...payload, totals: { subtotalYER: payload.totals.subtotalYER, shippingYER: payload.totals.shippingYER, totalYER: payload.totals.totalYER } });

    try {
      await fetch("/api/orders/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, totals: { ...payload.totals, subtotalUSD: subtotal, shippingUSD: shipping, totalUSD: finalTotal } }) });
    } catch { /* fire and forget */ }

    clear();
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 gap-4">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
          <Check size={36} className="text-white" />
        </div>
        <h2 className="text-foreground text-2xl font-bold font-cairo text-center">تم تأكيد طلبكِ</h2>
        <p className="text-muted-fg text-sm font-cairo text-center leading-7">شكراً لكِ! سيتم التواصل معك لتأكيد الشحنة.</p>
        <div className="flex items-center gap-2 bg-secondary rounded-2xl px-4 py-3 mt-1">
          <Truck size={16} className="text-primary" />
          <p className="text-primary text-sm font-semibold font-cairo">موعد التوصيل المتوقع: {getDeliveryEstimate()}</p>
        </div>
        <button onClick={() => router.replace("/")} className="mt-4 bg-foreground text-background px-7 py-3.5 rounded-3xl text-sm font-semibold font-cairo">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const inputClass = "w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-cairo text-foreground text-right outline-none focus:border-primary placeholder:text-muted-fg";

  return (
    <div className="bg-background min-h-screen pt-8 pb-40">
      <div className="px-5">
        <h1 className="text-foreground text-2xl font-bold font-cairo text-right mb-6">إتمام الشراء</h1>

        {/* Delivery Estimate */}
        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 mb-5 flex-row-reverse">
          <Truck size={18} className="text-primary flex-shrink-0" />
          <div className="text-right">
            <p className="text-foreground text-xs font-bold font-cairo">موعد التوصيل المتوقع</p>
            <p className="text-primary text-sm font-semibold font-cairo">{getDeliveryEstimate()}</p>
          </div>
        </div>

        <h2 className="text-foreground text-base font-bold font-cairo text-right mb-3">عنوان التوصيل</h2>
        <div className="flex flex-col gap-3 mb-6">
          {[
            { label: "الاسم الكامل", value: name, set: setName, placeholder: "مثال: نورة الأحمد" },
            { label: "رقم الجوال", value: phone, set: setPhone, placeholder: "7xxxxxxxx" },
            { label: "المدينة", value: city, set: setCity, placeholder: "مثال: صنعاء" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="text-muted-fg text-xs font-cairo block text-right mb-1.5">{label}</label>
              <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}
          <div>
            <label className="text-muted-fg text-xs font-cairo block text-right mb-1.5">العنوان التفصيلي</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الحي، الشارع، رقم المبنى" rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <h2 className="text-foreground text-base font-bold font-cairo text-right mb-3">طريقة الدفع</h2>
        <div className="flex flex-col gap-2.5 mb-6">
          {PAY_OPTIONS.map(({ key, label, icon: Icon }) => {
            const selected = key === pay;
            return (
              <button key={key} onClick={() => setPay(key)}
                className={`flex items-center flex-row-reverse gap-3 p-4 rounded-2xl border transition-colors ${selected ? "border-primary border-2 bg-secondary" : "border-border bg-card"}`}>
                <Icon size={20} className="text-foreground" />
                <span className="flex-1 text-foreground text-sm font-semibold font-cairo text-right">{label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary" : "border-border"}`}>
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Coupon */}
        <h2 className="text-foreground text-base font-bold font-cairo text-right mb-3">كوبون الخصم</h2>
        <div className="flex gap-2 mb-1 flex-row-reverse">
          <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="أدخلي الكوبون..." className={`${inputClass} flex-1`} />
          <button onClick={applyCoupon} className="bg-primary text-white px-5 rounded-xl text-sm font-bold font-cairo flex-shrink-0 hover:bg-rose-dark transition-colors">
            <Tag size={16} />
          </button>
        </div>
        {couponMsg && (
          <p className={`text-xs font-cairo text-right mb-4 ${couponApplied ? "text-green-600" : "text-primary"}`}>{couponMsg}</p>
        )}

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 mt-4">
          <div className="flex justify-between flex-row-reverse">
            <span className="text-muted-fg text-sm font-cairo">المجموع</span>
            <span className="text-foreground text-sm font-semibold font-cairo">{formatYER(subtotal)}</span>
          </div>
          <div className="flex justify-between flex-row-reverse">
            <span className="text-muted-fg text-sm font-cairo">الشحن</span>
            <span className="text-foreground text-sm font-semibold font-cairo">{shipping === 0 ? "مجاني" : formatYER(shipping)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between flex-row-reverse">
              <span className="text-green-600 text-sm font-cairo">خصم الكوبون ({couponDiscount * 100}%)</span>
              <span className="text-green-600 text-sm font-semibold font-cairo">- {formatYER(discountAmount)}</span>
            </div>
          )}
          <div className="border-t border-border my-1" />
          <div className="flex justify-between flex-row-reverse">
            <span className="text-foreground text-base font-bold font-cairo">الإجمالي</span>
            <div className="text-right">
              <p className="text-primary text-lg font-bold font-cairo">{formatYER(finalTotal)}</p>
              <p className="text-muted-fg text-xs font-cairo">{formatUSD(finalTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border px-5 py-4">
        {error && <p className="text-primary text-xs font-cairo text-right mb-2">{error}</p>}
        <button onClick={handleSubmit} disabled={!canSubmit || submitting}
          className={`w-full py-4 rounded-3xl text-base font-bold font-cairo transition-colors ${canSubmit && !submitting ? "bg-primary text-white hover:bg-rose-dark" : "bg-muted text-muted-fg cursor-not-allowed"}`}>
          {submitting ? "جاري إرسال تأكيد الطلب..." : `تأكيد الطلب · ${formatYER(finalTotal)}`}
        </button>
      </div>
    </div>
  );
}
