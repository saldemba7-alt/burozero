// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const AuthContext = createContext(null);

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar token guardado ao abrir a app
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("auth_token");
        if (saved) {
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
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expirado
        await logout();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // ── Auth flow ──────────────────────────────────────────────

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

    // Guardar token
    await SecureStore.setItemAsync("auth_token", data.access_token);
    setToken(data.access_token);
    setUser({ id: data.user_id, email: data.email });

    // Registar push token
    await registerPushToken(data.access_token);

    return data;
  }

  async function logout() {
    if (token) {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (_) {}
    }
    await SecureStore.deleteItemAsync("auth_token");
    setToken(null);
    setUser(null);
  }

  // ── Push notifications ────────────────────────────────────

  async function registerPushToken(tkn) {
    try {
      // Pedir permissão
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      // Android precisa de canal
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name:       "BuroZero",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      // Obter Expo Push Token
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // do app.json
      });

      // Registar no servidor
      await fetch(`${BASE_URL}/auth/push-token`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${tkn}`,
        },
        body: JSON.stringify({ push_token: pushToken }),
      });

      console.log("Push token registado:", pushToken);
    } catch (e) {
      console.error("Push token error:", e);
    }
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
