// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../services/api";

const AuthContext = createContext(null);

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("auth_token");
        if (saved) {
          setAuthToken(saved);
          setToken(saved);
          await loadUser(saved);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadUser(tkn) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        await SecureStore.deleteItemAsync("auth_token");
        setToken(null);
      }
    } catch (e) {
      console.error(e);
      await SecureStore.deleteItemAsync("auth_token");
      setToken(null);
    }
  }

  async function requestOTP(email) {
    const res = await fetch(`${BASE_URL}/auth/request-otp`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao enviar código");
    return data;
  }

  async function verifyOTP(email, code) {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Código inválido");
    await SecureStore.setItemAsync("auth_token", data.access_token);
    setAuthToken(data.access_token);
    setToken(data.access_token);
    setUser({ id: data.user_id, email: data.email });
    return data;
  }

  async function logout() {
    try {
      await SecureStore.deleteItemAsync("auth_token");
    } catch (_) {}
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      token, user, loading,
      isAuthenticated: !!token,
      requestOTP,
      verifyOTP,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
