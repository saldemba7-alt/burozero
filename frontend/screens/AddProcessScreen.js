// screens/AddProcessScreen.js
import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ProcessesAPI } from "../services/api";

const COLORS = {
  bg: "#0d1117", surface: "#161b22", surface2: "#1c2330",
  border: "#2a3548", accent: "#2563eb", text: "#e6edf3", muted: "#7d8590",
};

const ENTITIES = [
  { key: "AT",     label: "AT / Finanças", icon: "💰" },
  { key: "SS",     label: "Seg. Social",   icon: "🏥" },
  { key: "AIMA",   label: "AIMA",          icon: "🛂" },
  { key: "IMT",    label: "IMT",           icon: "🚗" },
  { key: "IMPIC",  label: "IMPIC",         icon: "🏗️" },
  { key: "CAMARA", label: "Câmara",        icon: "🏛️" },
  { key: "OUTRO",  label: "Outro",         icon: "📋" },
];

const PROCESS_TYPES = {
  AT:     ["IRS — Modelo 3", "IVA — Declaração Periódica", "IRC — Modelo 22", "Outro"],
  SS:     ["Declaração Trimestral SS", "Registo de trabalhador", "Outro"],
  AIMA:   ["Renovação Autorização Residência", "Primeiro pedido de residência", "Outro"],
  IMT:    ["Registo de veículo", "Carta de condução", "Outro"],
  IMPIC:  ["Alvará de construção", "Registo de empresa", "Outro"],
  CAMARA: ["Licença de Actividade", "Licença de obras", "Outro"],
  OUTRO:  ["Personalizado"],
};

export default function AddProcessScreen({ navigation }) {
  const [entity,   setEntity]   = useState(null);
  const [type,     setType]     = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [reference, setReference] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const title = type === "Outro" || type === "Personalizado" ? customTitle : type;

  async function save() {
    if (!entity || !title) {
      Alert.alert("Falta informação", "Selecciona a entidade e o tipo de processo.");
      return;
    }
    setSaving(true);
    try {
      await ProcessesAPI.create({
        title,
        entity,
        reference: reference || undefined,
        deadline:  deadline ? deadline.toISOString() : undefined,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.pageTitle}>Novo Processo</Text>
      <Text style={s.pageSubtitle}>Que entidade está envolvida?</Text>

      {/* Entity chips */}
      <View style={s.chipWrap}>
        {ENTITIES.map(e => (
          <TouchableOpacity
            key={e.key}
            style={[s.chip, entity === e.key && s.chipActive]}
            onPress={() => { setEntity(e.key); setType(null); }}
          >
            <Text style={s.chipIcon}>{e.icon}</Text>
            <Text style={[s.chipText, entity === e.key && s.chipTextActive]}>
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Process type */}
      {entity && (
        <>
          <Text style={s.label}>Tipo de processo</Text>
          <View style={s.typeList}>
            {(PROCESS_TYPES[entity] || []).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.typeRow, type === t && s.typeRowActive]}
                onPress={() => setType(t)}
              >
                <Text style={[s.typeText, type === t && s.typeTextActive]}>{t}</Text>
                {type === t && <Text style={{ color: COLORS.accent }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Custom title */}
      {(type === "Outro" || type === "Personalizado") && (
        <>
          <Text style={s.label}>Descrição do processo</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Renovação alvará empresa"
            placeholderTextColor={COLORS.muted}
            value={customTitle}
            onChangeText={setCustomTitle}
          />
        </>
      )}

      {/* Reference */}
      <Text style={s.label}>Referência do processo (opcional)</Text>
      <TextInput
        style={s.input}
        placeholder="Ex: AR/2024/0823"
        placeholderTextColor={COLORS.muted}
        value={reference}
        onChangeText={setReference}
      />

      {/* Deadline */}
      <Text style={s.label}>Prazo (opcional)</Text>
      <TouchableOpacity style={s.dateBtn} onPress={() => setShowDate(true)}>
        <Text style={{ color: deadline ? COLORS.text : COLORS.muted }}>
          {deadline
            ? deadline.toLocaleDateString("pt-PT")
            : "Seleccionar data limite"}
        </Text>
        <Text>📅</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDate(Platform.OS === "ios");
            if (date) setDeadline(date);
          }}
        />
      )}

      {/* Save */}
      <TouchableOpacity
        style={[s.saveBtn, (!entity || !title || saving) && { opacity: 0.5 }]}
        onPress={save}
        disabled={!entity || !title || saving}
      >
        <Text style={s.saveBtnText}>{saving ? "A guardar..." : "Guardar processo"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  pageTitle:      { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  pageSubtitle:   { fontSize: 14, color: COLORS.muted, marginBottom: 24 },
  label:          { fontSize: 11, fontWeight: "700", color: COLORS.muted, letterSpacing: 0.8, marginBottom: 8, marginTop: 20, textTransform: "uppercase" },
  chipWrap:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:           { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive:     { borderColor: COLORS.accent, backgroundColor: "rgba(37,99,235,0.1)" },
  chipIcon:       { fontSize: 14 },
  chipText:       { fontSize: 13, color: COLORS.muted, fontWeight: "500" },
  chipTextActive: { color: COLORS.accent },
  typeList:       { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, overflow: "hidden" },
  typeRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  typeRowActive:  { backgroundColor: "rgba(37,99,235,0.08)" },
  typeText:       { fontSize: 14, color: COLORS.text },
  typeTextActive: { color: COLORS.accent, fontWeight: "600" },
  input:          { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 14, color: COLORS.text },
  dateBtn:        { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, flexDirection: "row", justifyContent: "space-between" },
  saveBtn:        { backgroundColor: COLORS.accent, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 32 },
  saveBtnText:    { color: "white", fontWeight: "700", fontSize: 15 },
});
