import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 gap-4 text-center">
      <p className="text-8xl font-bold font-cairo text-primary/20">٤٠٤</p>
      <h1 className="text-foreground text-2xl font-bold font-cairo">الصفحة غير موجودة</h1>
      <p className="text-muted-fg text-sm font-cairo leading-7">عذراً، الصفحة التي تبحثين عنها غير متاحة أو تم نقلها.</p>
      <Link href="/" className="mt-4 bg-primary text-white px-7 py-3.5 rounded-3xl text-sm font-semibold font-cairo hover:bg-rose-dark transition-colors">
        العودة للرئيسية
      </Link>
    </div>
  );
}
