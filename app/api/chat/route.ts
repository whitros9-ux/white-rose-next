import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export type CustomerInfo = { name: string; email: string; phone: string };

export type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "support";
  sessionId: string;
  timestamp: string;
  customerInfo?: CustomerInfo;
};

const FILE = path.join(process.cwd(), "data", "chat.json");

function read(): ChatMessage[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

function write(messages: ChatMessage[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(messages), "utf-8");
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const admin = req.nextUrl.searchParams.get("admin");
  const messages = read();
  if (admin === "1") return NextResponse.json(messages);
  if (sessionId) return NextResponse.json(messages.filter((m) => m.sessionId === sessionId));
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, sender, sessionId, customerInfo } = body as Partial<ChatMessage>;
  if (!text?.trim() || !sender || !sessionId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const messages = read();
  const msg: ChatMessage = {
    id: Date.now().toString(),
    text: text.trim(),
    sender,
    sessionId,
    timestamp: new Date().toISOString(),
    ...(customerInfo ? { customerInfo } : {}),
  };
  messages.push(msg);
  write(messages);
  return NextResponse.json(msg);
}

export async function DELETE() {
  write([]);
  return NextResponse.json({ ok: true });
}
