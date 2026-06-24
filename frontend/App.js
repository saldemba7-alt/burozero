// App.js — root da app Expo
import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Screens
import LoginScreen      from "./screens/LoginScreen";
import HomeScreen       from "./screens/HomeScreen";
import AddProcessScreen from "./screens/AddProcessScreen";

const Stack  = createNativeStackNavigator();
const Tab    = createBottomTabNavigator();

const COLORS = { bg: "#0d1117", surface: "#161b22", border: "#2a3548", accent: "#2563eb", muted: "#7d8590", text: "#e6edf3" };

// ── Tab Navigator (autenticado) ───────────────────────────────
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:       false,
        tabBarStyle:       { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, paddingBottom: 20, height: 72 },
        tabBarActiveTintColor:   COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle:  { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Início", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }}
      />
      <Tab.Screen
        name="AddProcess"
        component={AddProcessScreen}
        options={{ tabBarLabel: "Adicionar", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text> }}
      />
    </Tab.Navigator>
  );
}

// ── Root Navigator (auth gate) ────────────────────────────────
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const navRef = useRef();
  const notifRef = useRef();

  // Navegar ao tocar numa notificação
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const { processId } = response.notification.request.content.data || {};
      if (processId && navRef.current) {
        navRef.current.navigate("ProcessDetail", { id: processId });
      }
    });
    return () => sub.remove();
  }, []);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={COLORS.accent} size="large" />
    </View>
  );

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle:       { backgroundColor: COLORS.bg },
          headerTintColor:   COLORS.text,
          headerBackTitleVisible: false,
          contentStyle:      { backgroundColor: COLORS.bg },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main"          component={AppTabs}          options={{ headerShown: false }} />
            <Stack.Screen name="ProcessDetail" component={AddProcessScreen} options={{ title: "Processo" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ── Export ────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

// Workaround — Text não está importado em Tab icons
import { Text } from "react-native";
