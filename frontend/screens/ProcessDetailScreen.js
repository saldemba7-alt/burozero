// screens/ProcessDetailScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Share,
} from "react-native";
import { ProcessesAPI } from "../services/api";

const C = {
  bg: "#0d1117", surface: "#161b22", surface2: "#1c2330",
  border: "#2a3548", accent: "#2563eb", danger: "#ef4444",
  warning: "#f59e0b", success: "#10b981", text: "#e6edf3", muted: "#7d8590",
};

const STATUS_CFG = {
  urgente:  { label: "Urgente",   color: C.danger  },
  parado:   { label: "Parado",    color: C.warning },
  pendente: { label: "Pendente",  color: C.warning },
  em_curso: { label: "Em curso",  color: C.accent  },
  concluido:{ label: "Concluído", color: C.success },
};

const ENTITY_ICONS = {
  AT: "💰", SS: "🏥", AIMA: "🛂", IMT: "🚗", IMPIC: "🏗️", CAMARA: "🏛️", OUTRO: "📋",
};

const PORTAL_URLS = {
  AT:     "https://www.portaldasfinancas.gov.pt",
  SS:     "https://www.seg-social.pt",
  AIMA:   "https://www.aima.gov.pt",
  IMT:    "https://www.imt-ip.pt",
  IMPIC:  "https://www.impic.pt",
  CAMARA: "https://www.cm-amadora.pt",
};

export default function ProcessDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [process,  setProcess]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(null); // step order being marked

  const load = useCallback(async () => {
    try {
      const p = await ProcessesAPI.get(id);
      setProcess(p);
      navigation.setOptions({ title: p.title });
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, []);

  async function markStep(stepOrder) {
    setMarking(stepOrder);
    try {
      const updated = await ProcessesAPI.markStepDone(id, stepOrder);
      setProcess(updated);
      if (updated.status === "concluido") {
        Alert.alert("🎉 Concluído!", "Processo marcado como concluído.");
      }
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setMarking(null);
    }
  }

  async function deleteProcess() {
    Alert.alert(
      "Eliminar processo",
      "Tens a certeza? Esta acção não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await ProcessesAPI.delete(id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  async function shareProcess() {
    if (!process) return;
    const doneSteps  = process.steps.filter(s => s.done).length;
    const totalSteps = process.steps.length;
    const status     = STATUS_CFG[process.status]?.label || process.status;
    const msg =
      `📋 ${process.title}\n` +
      `Entidade: ${process.entity}\n` +
      `Estado: ${status}\n` +
      (totalSteps ? `Progresso: ${doneSteps}/${totalSteps} passos\n` : "") +
      (process.deadline ? `Prazo: ${new Date(process.deadline).toLocaleDateString("pt-PT")}\n` : "") +
      `\nVia BuroZero — Anti-Burocracia Portugal`;
    await Share.share({ message: msg });
  }

  // ── Progress bar ─────────────────────────────────────────
  function ProgressBar({ steps }) {
    if (!steps?.length) return null;
    const done = steps.filter(s => s.done).length;
    const pct  = Math.round((done / steps.length) * 100);
    return (
      <View style={s.progressWrap}>
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>{done}/{steps.length} passos concluídos</Text>
          <Text style={[s.progressPct, { color: pct === 100 ? C.success : C.accent }]}>{pct}%</Text>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? C.success : C.accent }]} />
        </View>
      </View>
    );
  }

  // ── Deadline badge ────────────────────────────────────────
  function DeadlineBadge({ process: p }) {
    if (!p.deadline) return null;
    const days = p.days_until_deadline;
    const isUrgent = days !== null && days <= 5;
    const color = days <= 0 ? C.danger : days <= 5 ? C.danger : days <= 14 ? C.warning : C.success;
    const label = days < 0
      ? `Expirou há ${Math.abs(days)} dias`
      : days === 0
      ? "Prazo hoje!"
      : `${days} dias restantes`;

    return (
      <View style={[s.deadlineBadge, { borderColor: color, backgroundColor: `${color}18` }]}>
        <Text style={[s.deadlineIcon]}>{days <= 5 ? "🚨" : "📅"}</Text>
        <View>
          <Text style={[s.deadlineLabel, { color }]}>{label}</Text>
          <Text style={s.deadlineDate}>
            Prazo: {new Date(p.deadline).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </View>
      </View>
    );
  }

  if (loading) return (
    <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );

  if (!process) return null;

  const cfg         = STATUS_CFG[process.status] || STATUS_CFG.pendente;
  const entityIcon  = ENTITY_ICONS[process.entity] || "📋";
  const portalUrl   = PORTAL_URLS[process.entity];
  const activeStep  = process.steps.find(s => !s.done);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.entityRow}>
            <Text style={s.entityIcon}>{entityIcon}</Text>
            <Text style={s.entityName}>{process.entity}</Text>
            {process.reference
              ? <Text style={s.ref}>· {process.reference}</Text>
              : null}
          </View>
          <View style={[s.statusBadge, { backgroundColor: `${cfg.color}18`, borderColor: `${cfg.color}44` }]}>
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={s.title}>{process.title}</Text>

        {/* Deadline */}
        <DeadlineBadge process={process} />

        {/* Stalled warning */}
        {process.days_since_update > 30 && process.status !== "concluido" && (
          <View style={s.stalledBanner}>
            <Text style={s.stalledText}>
              ⏸ Sem actualização há {process.days_since_update} dias — verifica o estado em {process.entity}
            </Text>
          </View>
        )}

        {/* Progress */}
        <ProgressBar steps={process.steps} />

        {/* Steps */}
        {process.steps.length > 0 && (
          <>
            <Text style={s.sectionTitle}>PASSO A PASSO</Text>
            <View style={s.stepsList}>
              {process.steps.map((step, i) => {
                const isActive  = step.order === activeStep?.order;
                const isDone    = step.done;
                const isMarking = marking === step.order;

                return (
                  <View key={step.order} style={s.stepRow}>
                    {/* Line */}
                    {i < process.steps.length - 1 && (
                      <View style={[s.stepLine, isDone && { backgroundColor: C.success }]} />
                    )}

                    {/* Dot */}
                    <TouchableOpacity
                      style={[
                        s.stepDot,
                        isDone  && { backgroundColor: C.success, borderColor: C.success },
                        isActive && !isDone && { borderColor: C.accent },
                      ]}
                      onPress={() => !isDone && markStep(step.order)}
                      disabled={isDone || !!marking}
                    >
                      {isMarking
                        ? <ActivityIndicator color={C.accent} size="small" />
                        : <Text style={[s.stepDotText, isDone && { color: "white" }]}>
                            {isDone ? "✓" : step.order}
                          </Text>
                      }
                    </TouchableOpacity>

                    {/* Content */}
                    <View style={[s.stepContent, i < process.steps.length - 1 && { paddingBottom: 24 }]}>
                      <Text style={[
                        s.stepName,
                        isDone   && { color: C.muted, textDecorationLine: "line-through" },
                        isActive && { color: C.text, fontWeight: "700" },
                      ]}>
                        {step.name}
                      </Text>
                      <Text style={s.stepDetail}>{step.detail}</Text>

                      {/* CTA on active step */}
                      {isActive && !isDone && (
                        <TouchableOpacity
                          style={s.stepBtn}
                          onPress={() => markStep(step.order)}
                          disabled={!!marking}
                        >
                          <Text style={s.stepBtnText}>Marcar como feito →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* No steps state */}
        {process.steps.length === 0 && (
          <View style={s.emptySteps}>
            <Text style={s.emptyStepsText}>Sem passos definidos para este processo.</Text>
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
          {portalUrl && (
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => Alert.alert("Portal", `Abre: ${portalUrl}`)}
            >
              <Text style={s.actionIcon}>🌐</Text>
              <Text style={s.actionText}>Ir ao portal {process.entity}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.actionBtn} onPress={shareProcess}>
            <Text style={s.actionIcon}>📤</Text>
            <Text style={s.actionText}>Partilhar processo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.actionBtn, s.actionDanger]} onPress={deleteProcess}>
            <Text style={s.actionIcon}>🗑️</Text>
            <Text style={[s.actionText, { color: C.danger }]}>Eliminar processo</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg },
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  entityRow:     { flexDirection: "row", alignItems: "center", gap: 6 },
  entityIcon:    { fontSize: 18 },
  entityName:    { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 0.5 },
  ref:           { fontSize: 12, color: C.muted },
  statusBadge:   { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:    { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  title:         { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 16, lineHeight: 28 },

  deadlineBadge: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  deadlineIcon:  { fontSize: 20 },
  deadlineLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  deadlineDate:  { fontSize: 12, color: C.muted },

  stalledBanner: { backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, marginBottom: 12 },
  stalledText:   { fontSize: 13, color: C.warning, lineHeight: 18 },

  progressWrap:  { marginBottom: 24 },
  progressRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 12, color: C.muted },
  progressPct:   { fontSize: 12, fontWeight: "700" },
  progressBg:    { height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 3 },

  sectionTitle:  { fontSize: 11, fontWeight: "700", color: C.muted, letterSpacing: 0.8, marginBottom: 16 },

  stepsList:     { paddingLeft: 0 },
  stepRow:       { flexDirection: "row", gap: 14, position: "relative" },
  stepLine:      { position: "absolute", left: 15, top: 32, bottom: 0, width: 2, backgroundColor: C.border, zIndex: 0 },
  stepDot:       { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: C.border, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", zIndex: 1, flexShrink: 0 },
  stepDotText:   { fontSize: 12, fontWeight: "700", color: C.muted },
  stepContent:   { flex: 1 },
  stepName:      { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 4, marginTop: 4 },
  stepDetail:    { fontSize: 12, color: C.muted, lineHeight: 18 },
  stepBtn:       { marginTop: 10, backgroundColor: "rgba(37,99,235,0.15)", borderWidth: 1, borderColor: C.accent, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignSelf: "flex-start" },
  stepBtnText:   { fontSize: 13, fontWeight: "600", color: C.accent },

  emptySteps:    { alignItems: "center", padding: 24 },
  emptyStepsText:{ color: C.muted, fontSize: 14 },

  actions:       { marginTop: 32, gap: 8 },
  actionBtn:     { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16 },
  actionDanger:  { borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" },
  actionIcon:    { fontSize: 18 },
  actionText:    { fontSize: 14, fontWeight: "600", color: C.text },
});
