"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  getToken, setToken, removeToken,
  getStoredUser, setStoredUser, fetchMe,
} from "@/lib/auth";
import { API_BASE_URL } from "@/lib/utils";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate token on app load
  useEffect(() => {
    async function init() {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setTokenState(storedToken);
      // Try to get cached user first
      const cachedUser = getStoredUser();
      if (cachedUser) setUser(cachedUser);
      // Validate against server
      const me = await fetchMe();
      if (me) {
        setUser(me);
        setStoredUser(me);
      } else {
        // Token expired or invalid
        removeToken();
        setTokenState(null);
        setUser(null);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed.");
    }
    const data = await res.json();
    setToken(data.access_token);
    setTokenState(data.access_token);
    const userObj: AuthUser = {
      id: data.user_id,
      full_name: data.full_name,
      email: data.email,
      created_at: new Date().toISOString(),
    };
    setUser(userObj);
    setStoredUser(userObj);
    router.push("/dashboard");
  }, [router]);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Sign up failed.");
    }
    const data = await res.json();
    setToken(data.access_token);
    setTokenState(data.access_token);
    const userObj: AuthUser = {
      id: data.user_id,
      full_name: data.full_name,
      email: data.email,
      created_at: new Date().toISOString(),
    };
    setUser(userObj);
    setStoredUser(userObj);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
