import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function formatUSDValue(value: unknown): string {
  return `$${toNumber(value).toFixed(2)}`;
}
function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
}

function buildOrderEmail(order: any) {
  const customer = order.customer ?? {};
  const totals = order.totals ?? {};
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const orderId = String(order.orderId ?? `WR-${Date.now()}`);
  const orderDate = formatOrderDate(order.createdAt ?? new Date().toISOString());
  const paymentMethodLabel = order.paymentMethodLabel ?? order.paymentMethod ?? "-";

  const itemsHtml = items.map((item, i) => {
    const color = item.color ? `<div style="font-size:12px;color:#666;">اللون: ${escapeHtml(item.color)}</div>` : "";
    const size = item.size ? `<div style="font-size:12px;color:#666;">المقاس: ${escapeHtml(item.size)}</div>` : "";
    return `<tr>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${i + 1}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;"><div style="font-weight:700;">${escapeHtml(item.name)}</div>${color}${size}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${toNumber(item.quantity)}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(formatUSDValue(item.unitPriceUsd))}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(formatUSDValue(item.lineTotalUsd))}</td>
    </tr>`;
  }).join("");

  const subject = `تأكيد طلب جديد - ${orderId}`;
  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:760px;margin:0 auto;padding:20px;color:#111;">
      <h2 style="margin:0 0 16px;">تم استلام طلب جديد</h2>
      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:12px;padding:14px;margin-bottom:16px;">
        <div><strong>رقم الطلب:</strong> ${escapeHtml(orderId)}</div>
        <div><strong>تاريخ الطلب:</strong> ${escapeHtml(orderDate)}</div>
        <div><strong>طريقة الدفع:</strong> ${escapeHtml(paymentMethodLabel)}</div>
      </div>
      <h3 style="margin:0 0 10px;">بيانات العميل</h3>
      <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;margin-bottom:16px;">
        <div><strong>الاسم:</strong> ${escapeHtml(customer.name ?? "-")}</div>
        <div><strong>الجوال:</strong> ${escapeHtml(customer.phone ?? "-")}</div>
        <div><strong>البريد:</strong> ${escapeHtml(customer.email ?? "-")}</div>
        <div><strong>المدينة:</strong> ${escapeHtml(customer.city ?? "-")}</div>
        <div><strong>العنوان:</strong> ${escapeHtml(customer.address ?? "-")}</div>
      </div>
      <h3 style="margin:0 0 10px;">تفاصيل المنتجات</h3>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;margin-bottom:16px;">
        <thead><tr style="background:#fafafa;">
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">#</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">المنتج</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">الكمية</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">سعر القطعة</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">الإجمالي</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3 style="margin:0 0 10px;">ملخص الفاتورة</h3>
      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:12px;padding:14px;">
        <div><strong>المجموع:</strong> ${escapeHtml(totals.subtotalYER ?? "-")} (${escapeHtml(formatUSDValue(totals.subtotalUSD))})</div>
        <div><strong>الشحن:</strong> ${escapeHtml(totals.shippingYER ?? "-")} (${escapeHtml(formatUSDValue(totals.shippingUSD))})</div>
        <div style="margin-top:8px;font-size:16px;"><strong>الإجمالي:</strong> ${escapeHtml(totals.totalYER ?? "-")} (${escapeHtml(formatUSDValue(totals.totalUSD))})</div>
      </div>
    </div>`;

  return { subject, html };
}

export async function POST(req: NextRequest) {
  const user = (process.env.ORDER_EMAIL_USER ?? "").trim();
  const pass = (process.env.ORDER_EMAIL_PASS ?? "").trim().replace(/\s+/g, "");
  if (!user || !pass) {
    return NextResponse.json({ ok: false, error: "إعدادات البريد غير مضبوطة" }, { status: 500 });
  }

  let payload: any;
  try { payload = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!payload?.customer?.name || !payload?.customer?.phone || !Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ ok: false, error: "بيانات الطلب ناقصة" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ORDER_EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.ORDER_EMAIL_PORT ?? 465),
      secure: (process.env.ORDER_EMAIL_SECURE ?? "true") === "true",
      auth: { user, pass },
    });
    const { subject, html } = buildOrderEmail(payload);
    const to = (process.env.ORDER_EMAIL_TO ?? user).trim();
    const fromAddress = (process.env.ORDER_EMAIL_FROM ?? user).trim();
    const fromName = (process.env.ORDER_EMAIL_FROM_NAME ?? "White Rose Store").trim();
    await transporter.sendMail({ from: `"${fromName}" <${fromAddress}>`, to, replyTo: payload.customer.email ?? undefined, subject, html });
    return NextResponse.json({ ok: true, message: "تم إرسال إيميل تأكيد الطلب" });
  } catch (err) {
    console.error("Order email failed:", err);
    return NextResponse.json({ ok: false, error: "تعذر إرسال إيميل التأكيد" }, { status: 502 });
  }
}
