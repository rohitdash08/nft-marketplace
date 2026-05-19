"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  sub: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) setUser(data);
        else localStorage.removeItem("auth_token");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (provider: "google" | "github" | "apple") => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    router.push("/");
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
