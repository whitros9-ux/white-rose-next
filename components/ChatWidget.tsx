"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useSupportChat } from "@/contexts/SupportChatContext";

export function ChatWidget() {
  const { messages, sendMessage, unreadCount, markRead } = useSupportChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      markRead();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [open, messages, markRead]);

  const handleOpen = () => { setOpen(true); markRead(); };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input.trim());
    setInput("");
    setSending(false);
  };

  const fmt = (ts: string) => new Date(ts).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end pointer-events-none">
          <div className="pointer-events-auto mx-3 mb-24 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "70vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary">
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                <X size={16} className="text-white" />
              </button>
              <div className="text-right">
                <p className="text-white text-sm font-bold font-cairo">خدمة العملاء</p>
                <p className="text-white/70 text-xs font-cairo">الوردة البيضاء</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={18} className="text-white" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ direction: "rtl" }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-fg text-sm font-cairo">مرحباً! كيف يمكننا مساعدتك؟</p>
                </div>
              )}
              {messages.map((msg) => {
                const isCustomer = msg.sender === "customer";
                return (
                  <div key={msg.id} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm font-cairo leading-6 ${
                      isCustomer ? "bg-primary text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-muted-fg text-[10px] font-cairo mt-1 px-1">{fmt(msg.timestamp)}</span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 flex-row-reverse">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتبي رسالتك..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-cairo text-foreground text-right outline-none focus:border-primary placeholder:text-muted-fg"
              />
              <button onClick={handleSend} disabled={!input.trim() || sending}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!open && (
        <button onClick={handleOpen}
          className="fixed left-4 bottom-24 z-[250] w-13 h-13 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-rose-dark transition-colors"
          style={{ width: 52, height: 52 }}>
          <MessageCircle size={24} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  );
}
