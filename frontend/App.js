// App.js
import { registerRootComponent } from 'expo';
import React, { createBottomTabNavigator } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, ScrollView } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddProcessScreen from './screens/ProcessDetailScreen';
import NewProcessScreen from './screens/AddProcessScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
          <Text style={{ color: 'red', fontSize: 18, marginTop: 50 }}>ERRO:</Text>
          <Text style={{ color: 'white', fontSize: 12, marginTop: 10 }}>
            {this.state.error?.toString()}
          </Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 10 }}>
            {this.state.error?.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

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
  return isAuthenticated ? (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProcessDetail" component={AddProcessScreen} options={{ title: "Processo" }} />
      <Stack.Screen name="AddProcess" component={NewProcessScreen} options={{ title: "Novo Processo" }} />
    </Stack.Navigator>
  ) : (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}

registerRootComponent(App);
