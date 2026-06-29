// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from "react-native";
import { ProcessesAPI, AlertsAPI, CalendarAPI } from "../services/api";
import ProcessCard from "../components/ProcessCard";
import UrgencyBanner from "../components/UrgencyBanner";
import StatsRow from "../components/StatsRow";

const COLORS = {
  bg:       "#0d1117",
  surface:  "#161b22",
  border:   "#2a3548",
  accent:   "#2563eb",
  danger:   "#ef4444",
  warning:  "#f59e0b",
  success:  "#10b981",
  text:     "#e6edf3",
  muted:    "#7d8590",
};

export default function HomeScreen({ navigation }) {
  const [processes,   setProcesses]   = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [upcoming,    setUpcoming]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = useCallback(async () => {
    try {
        const procs = await ProcessesAPI.list();
        setProcesses(procs);
      } catch (e) { console.error('P', e); }
      try {
        const alts = await AlertsAPI.list(true);
        setAlerts(alts);
      } catch (e) { console.error('A', e); }
      try {
        const cal = await CalendarAPI.getUpcoming(30);
        setUpcoming(cal);
      } catch (e) { console.error('C', e); }
      setLoading(false);
      setRefreshing(false);
    }, []);

  useEffect(() => { load(); }, []);

  // Urgent = deadline in ≤5 days OR stalled > 30 days
  const urgentProcess = processes.find(
    p => (p.days_until_deadline !== null && p.days_until_deadline <= 5)
      || p.days_since_update > 30
  );

  const stats = {
    urgent:  processes.filter(p => p.status === "urgente").length,
    pending: processes.filter(p => ["pendente", "em_curso"].includes(p.status)).length,
    ok:      processes.filter(p => p.status === "concluido").length,
  };

  if (loading) return (
    <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator color={COLORS.accent} size="large" />
    </View>
  );

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={COLORS.accent}
        />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>Buro<Text style={{ color: COLORS.accent }}>Zero</Text></Text>
        <TouchableOpacity
          style={s.notifBtn}
          onPress={() => navigation.navigate("Alerts")}
        >
          <Text style={s.notifIcon}>🔔</Text>
          {alerts.length > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={s.greeting}>
        <Text style={s.greetingSub}>Bom dia 👋</Text>
        <Text style={s.greetingMain}>
          {urgentProcess
            ? `Tens ${stats.urgent || 1} prazo urgente`
            : "Tudo em ordem por hoje"}
        </Text>
      </View>

      {/* Urgency Banner */}
      {urgentProcess && (
        <UrgencyBanner
          process={urgentProcess}
          onPress={() => navigation.navigate("ProcessDetail", { id: urgentProcess.id })}
        />
      )}

      {/* Stats */}
      <StatsRow stats={stats} />

      {/* Process list */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>OS MEUS PROCESSOS</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddProcess")}>
          <Text style={s.addLink}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {processes.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>Sem processos ainda.</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => navigation.navigate("AddProcess")}
          >
            <Text style={s.emptyBtnText}>Adicionar primeiro processo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        processes.map(p => (
          <ProcessCard
            key={p.id}
            process={p}
            onPress={() => navigation.navigate("ProcessDetail", { id: p.id })}
          />
        ))
      )}

      {/* Upcoming fiscal events */}
      {upcoming.length > 0 && (
        <>
          <View style={[s.sectionHeader, { marginTop: 24 }]}>
            <Text style={s.sectionTitle}>PRÓXIMOS PRAZOS FISCAIS</Text>
          </View>
          {upcoming.slice(0, 3).map((e, i) => (
            <View key={i} style={s.calEvent}>
              <View style={s.calDate}>
                <Text style={s.calDay}>{e.date.slice(8, 10)}</Text>
                <Text style={s.calMonth}>
                  {new Date(e.date).toLocaleString("pt-PT", { month: "short" }).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.calTitle}>{e.title}</Text>
                <Text style={s.calEntity}>{e.entity}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 0 },
  logo:         { fontFamily: "SpaceGrotesk-Bold", fontSize: 22, color: COLORS.text },
  notifBtn:     { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  notifIcon:    { fontSize: 16 },
  badge:        { position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  badgeText:    { color: "white", fontSize: 9, fontWeight: "700" },
  greeting:     { padding: 20, paddingBottom: 0 },
  greetingSub:  { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  greetingMain: { fontFamily: "SpaceGrotesk-Bold", fontSize: 20, color: COLORS.text },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: COLORS.muted, letterSpacing: 0.8 },
  addLink:      { fontSize: 13, color: COLORS.accent },
  emptyState:   { alignItems: "center", padding: 40 },
  emptyIcon:    { fontSize: 40, marginBottom: 12 },
  emptyText:    { color: COLORS.muted, marginBottom: 16 },
  emptyBtn:     { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: "white", fontWeight: "600" },
  calEvent:     { flexDirection: "row", gap: 14, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  calDate:      { width: 36, alignItems: "center" },
  calDay:       { fontFamily: "SpaceGrotesk-Bold", fontSize: 18, color: COLORS.text, lineHeight: 20 },
  calMonth:     { fontSize: 9, color: COLORS.muted, fontWeight: "600" },
  calTitle:     { fontSize: 13, fontWeight: "600", color: COLORS.text, marginBottom: 2 },
  calEntity:    { fontSize: 11, color: COLORS.muted },
});
