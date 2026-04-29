"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "support";
  sessionId: string;
  timestamp: string;
};

type SupportChatContextValue = {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  sessionId: string;
  unreadCount: number;
  markRead: () => void;
};

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("@whiterose/sessionId");
  if (!sid) {
    sid = `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("@whiterose/sessionId", sid);
  }
  return sid;
}

export function SupportChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [lastReadCount, setLastReadCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sidRef = useRef("");
  const prevCountRef = useRef(0);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    sidRef.current = sid;

    const fetchMessages = async () => {
      if (!sidRef.current) return;
      try {
        const res = await fetch(`/api/chat?sessionId=${sidRef.current}`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          const newSupportMsgs = data.filter((m) => m.sender === "support").length;
          if (newSupportMsgs > prevCountRef.current) playNotificationSound();
          prevCountRef.current = newSupportMsgs;
          setMessages(data);
        }
      } catch {}
    };

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const sid = sidRef.current;
    const u = userRef.current;
    if (!sid || !text.trim() || !u) return;
    const customerInfo = { name: u.name, email: u.email, phone: u.phone };
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.trim(), sender: "customer", sessionId: sid, customerInfo }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } catch {}
  }, []);

  const supportReplies = messages.filter((m) => m.sender === "support").length;
  const unreadCount = Math.max(0, supportReplies - lastReadCount);

  const markRead = useCallback(() => {
    const count = messages.filter((m) => m.sender === "support").length;
    setLastReadCount(count);
  }, [messages]);

  return (
    <SupportChatContext.Provider value={{ messages, sendMessage, sessionId, unreadCount, markRead }}>
      {children}
    </SupportChatContext.Provider>
  );
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) throw new Error("useSupportChat must be used within SupportChatProvider");
  return ctx;
}
