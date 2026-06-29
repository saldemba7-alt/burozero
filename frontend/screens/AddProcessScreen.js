import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { ProcessesAPI } from "../services/api";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "#2a3548",
  accent: "#2563eb", danger: "#ef4444", text: "#e6edf3", muted: "#7d8590",
};

const ENTITIES = ["AT", "SS", "AIMA", "IMT", "IMPIC", "CAMARA", "OUTRO"];

export default function AddProcessScreen({ navigation }) {
  const [title,     setTitle]     = useState("");
  const [entity,    setEntity]    = useState("AT");
  const [reference, setReference] = useState("");
  const [deadline,  setDeadline]  = useState("");
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Erro", "O título é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        entity,
        reference: reference.trim() || null,
        deadline: deadline.trim() || null,
      };
      await ProcessesAPI.create(data);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.label}>Título *</Text>
      <TextInput
        style={s.input}
        placeholder="Ex: Renovação Cartão Cidadão"
        placeholderTextColor={C.muted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={s.label}>Entidade *</Text>
      <View style={s.entityRow}>
        {ENTITIES.map(e => (
          <TouchableOpacity
            key={e}
            style={[s.entityBtn, entity === e && s.entityBtnActive]}
            onPress={() => setEntity(e)}
          >
            <Text style={[s.entityBtnText, entity === e && s.entityBtnTextActive]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Referência</Text>
      <TextInput
        style={s.input}
        placeholder="Ex: 2024/12345"
        placeholderTextColor={C.muted}
        value={reference}
        onChangeText={setReference}
      />

      <Text style={s.label}>Prazo (AAAA-MM-DD)</Text>
      <TextInput
        style={s.input}
        placeholder="Ex: 2025-06-30"
        placeholderTextColor={C.muted}
        value={deadline}
        onChangeText={setDeadline}
        keyboardType="numbers-and-punctuation"
      />

      <TouchableOpacity
        style={[s.btn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="white" />
          : <Text style={s.btnText}>Criar processo</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: C.bg },
  label:              { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  input:              { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, fontSize: 15, color: C.text },
  entityRow:          { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  entityBtn:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  entityBtnActive:    { backgroundColor: "rgba(37,99,235,0.15)", borderColor: C.accent },
  entityBtnText:      { fontSize: 13, fontWeight: "600", color: C.muted },
  entityBtnTextActive:{ color: C.accent },
  btn:                { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 32 },
  btnText:            { color: "white", fontWeight: "700", fontSize: 16 },
});
