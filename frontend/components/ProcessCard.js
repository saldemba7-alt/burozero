// components/ProcessCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const STATUS_CONFIG = {
  urgente:  { label: "Urgente",  bg: "rgba(239,68,68,0.12)",   text: "#ef4444", bar: "#ef4444" },
  parado:   { label: "Parado",   bg: "rgba(245,158,11,0.12)",  text: "#f59e0b", bar: "#f59e0b" },
  pendente: { label: "Pendente", bg: "rgba(245,158,11,0.12)",  text: "#f59e0b", bar: "#f59e0b" },
  em_curso: { label: "Em curso", bg: "rgba(37,99,235,0.12)",   text: "#60a5fa", bar: "#2563eb" },
  concluido:{ label: "Concluído",bg: "rgba(16,185,129,0.12)",  text: "#10b981", bar: "#10b981" },
};

const ENTITY_ICONS = {
  AT: "💰", SS: "🏥", AIMA: "🛂", IMT: "🚗", IMPIC: "🏗️", CAMARA: "🏛️", OUTRO: "📋",
};

export default function ProcessCard({ process: p, onPress }) {
  const cfg    = STATUS_CONFIG[p.status] || STATUS_CONFIG.pendente;
  const icon   = ENTITY_ICONS[p.entity] || "📋";
  const isLate = p.days_until_deadline !== null && p.days_until_deadline <= 5;
  const isStalled = p.days_since_update > 30;

  let detail = "";
  if (p.deadline) {
    const d = p.days_until_deadline;
    detail = d <= 0
      ? "⚠️ Prazo expirado"
      : `📅 Prazo em ${d} dia${d === 1 ? "" : "s"}`;
  } else if (isStalled) {
    detail = `⏸ Parado há ${p.days_since_update} dias`;
  } else if (p.reference) {
    detail = `📋 Ref: ${p.reference}`;
  }

  return (
    <TouchableOpacity style={[s.card, { borderLeftColor: cfg.bar }]} onPress={onPress} activeOpacity={0.75}>
      <View style={s.header}>
        <View style={s.entityRow}>
          <Text style={s.icon}>{icon}</Text>
          <Text style={s.entity}>{p.entity}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.badgeText, { color: cfg.text }]}>{cfg.label.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={s.title}>{p.title}</Text>
      {detail ? <Text style={[s.detail, isLate && { color: "#ef4444" }]}>{detail}</Text> : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:      { backgroundColor: "#161b22", borderWidth: 1, borderColor: "#2a3548", borderLeftWidth: 3, borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 10 },
  header:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  entityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  icon:      { fontSize: 16 },
  entity:    { fontSize: 11, fontWeight: "700", color: "#7d8590", letterSpacing: 0.5 },
  badge:     { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  title:     { fontSize: 14, fontWeight: "600", color: "#e6edf3", marginBottom: 4 },
  detail:    { fontSize: 12, color: "#7d8590" },
});
