// App.js
import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddProcessScreen from './screens/ProcessDetailScreen';
import NewProcessScreen from './screens/AddProcessScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const COLORS = { bg: "#0d1117", surface: "#161b22", border: "#2a3548", accent: "#2563eb", muted: "#7d8590", text: "#e6edf3" };

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: COLORS.bg, borderTopColor: COLORS.border }, tabBarActiveTintColor: COLORS.accent, tabBarInactiveTintColor: COLORS.muted }}>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={COLORS.accent} size="large" />
    </View>
  );
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.bg }, headerTintColor: COLORS.text, headerBackTitleVisible: false, contentStyle: { backgroundColor: COLORS.bg } }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProcessDetail" component={AddProcessScreen} options={{ title: "Processo" }} />
            <Stack.Screen name="AddProcess" component={NewProcessScreen} options={{ title: "Novo Processo" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

registerRootComponent(App);
