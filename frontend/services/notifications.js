// services/notifications.js
// Pede autorização para notificações, obtém o Expo push token
// e envia-o ao backend para o servidor poder avisar dos prazos.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Mostrar a notificação mesmo com a app aberta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(baseUrl, authToken) {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("prazos", {
        name: "Prazos",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }
    if (status !== "granted") return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!pushToken) return null;

    await fetch(`${baseUrl}/auth/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });
    return pushToken;
  } catch (e) {
    // Nunca bloquear a app se as notificações falharem
    console.warn("Push registration failed:", e?.message || e);
    return null;
  }
}
