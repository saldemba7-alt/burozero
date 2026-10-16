// screens/AlertsScreen.js
// Lista de alertas (prazos a chegar, prazos ultrapassados, processos parados)
import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { AlertsAPI } from "../services/api";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "#2a3548",
  accent: "#2563eb", danger: "#ef4444", warning: "#f59e0b",
  text: "#e6edf3", muted: "#7d8590",
};

const LEVEL_COLOR = { urgent: C.danger, warning: C.warning, info: C.accent };

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

export default function AlertsScreen({ navigation }) {
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setAlerts(await AlertsAPI.list(false));
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os alertas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openAlert(a) {
    if (!a.read) {
      setAlerts(list => list.map(x => (x.id === a.id ? { ...x, read: true } : x)));
      AlertsAPI.markRead(a.id).catch(() => {});
    }
    if (a.process_id) navigation.navigate("ProcessDetail", { id: a.process_id });
  }

  async function markAll() {
    setAlerts(list => list.map(x => ({ ...x, read: true })));
    try { await AlertsAPI.markAllRead(); } catch (_) { load(); }
  }

  const unread = alerts.filter(a => !a.read).length;

  if (loading) return (
    <View style={[s.container, s.center]}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );

  return (
    <View style={s.container}>
      {unread > 0 && (
        <TouchableOpacity style={s.markAll} onPress={markAll}>
          <Text style={s.markAllText}>Marcar todos como lidos ({unread})</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={alerts}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={C.accent}
          />
        }
        ListEmptyComponent={
          <View style={[s.center, { flex: 1, paddingTop: 80 }]}>
            <Text style={{ fontSize: 40 }}>🔕</Text>
            <Text style={s.emptyTitle}>Sem alertas</Text>
            <Text style={s.emptySub}>Avisamos-te aqui quando um prazo estiver a chegar.</Text>
          </View>
        }
        renderItem={({ item: a }) => (
          <TouchableOpacity
            style={[s.card, { borderLeftColor: LEVEL_COLOR[a.level] || C.accent }, a.read && s.cardRead]}
            onPress={() => openAlert(a)}
          >
            <View style={s.row}>
              <Text style={[s.title, a.read && { color: C.muted }]} numberOfLines={2}>{a.title}</Text>
              {!a.read && <View style={s.dot} />}
            </View>
            <Text style={s.message}>{a.message}</Text>
            <Text style={s.time}>{timeAgo(a.created_at)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  center:      { alignItems: "center", justifyContent: "center" },
  markAll:     { marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  markAllText: { color: C.accent, fontWeight: "600", fontSize: 14 },
  card:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardRead:    { opacity: 0.6 },
  row:         { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title:       { flex: 1, color: C.text, fontSize: 15, fontWeight: "700" },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 6 },
  message:     { color: C.muted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  time:        { color: C.muted, fontSize: 11, marginTop: 8 },
  emptyTitle:  { color: C.text, fontSize: 17, fontWeight: "700", marginTop: 12 },
  emptySub:    { color: C.muted, fontSize: 14, marginTop: 6, textAlign: "center", paddingHorizontal: 32 },
});
