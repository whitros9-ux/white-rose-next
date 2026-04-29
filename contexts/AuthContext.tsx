"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { email: string; phone: string; name: string; role: "admin" | "user" };
type AuthContextValue = { user: User | null; login: (email: string, phone: string) => void; logout: () => void };

const ADMIN_ACCOUNT = { email: "kog24kog@gmail.com", phone: "771074445", name: "أدمن" };
const STORAGE_KEY = "@white-rose:user";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const login = (email: string, phone: string) => {
    const e = email.trim().toLowerCase();
    const p = phone.trim();
    const isAdmin = e === ADMIN_ACCOUNT.email && p === ADMIN_ACCOUNT.phone;
    const nextUser: User = isAdmin
      ? { email: ADMIN_ACCOUNT.email, phone: ADMIN_ACCOUNT.phone, name: ADMIN_ACCOUNT.name, role: "admin" }
      : { email: e, phone: p, name: e.split("@")[0] || "مستخدم", role: "user" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
