// screens/LoginScreen.js
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const C = {
  bg:      "#0d1117",
  surface: "#161b22",
  border:  "#2a3548",
  accent:  "#2563eb",
  danger:  "#ef4444",
  text:    "#e6edf3",
  muted:   "#7d8590",
};

export default function LoginScreen() {
  const { requestOTP, verifyOTP } = useAuth();

  const [step,    setStep]    = useState("email");   // "email" | "otp"
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const otpRefs = useRef([]);

  // ── Step 1: pedir OTP ────────────────────────────────────
  async function handleRequestOTP() {
    if (!email.includes("@")) {
      setError("Insere um email válido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestOTP(email);
      setStep("otp");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verificar OTP ────────────────────────────────
  async function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Insere o código completo de 6 dígitos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOTP(email, code);
      // AuthContext actualiza o estado → Navigator redireciona automaticamente
    } catch (e) {
      setError(e.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(value, index) {
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Avança para o próximo campo automaticamente
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submete quando completo
    if (index === 5 && value) {
      const code = [...next].join("");
      if (code.length === 6) handleVerifyOTP();
    }
  }

  function handleOtpBackspace(e, index) {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>

        {/* Logo */}
        <Text style={s.logo}>
          Buro<Text style={{ color: C.accent }}>Zero</Text>
        </Text>
        <Text style={s.tagline}>Anti-Burocracia Portugal 🇵🇹</Text>

        {/* EMAIL STEP */}
        {step === "email" && (
          <>
            <Text style={s.title}>Entra na tua conta</Text>
            <Text style={s.subtitle}>
              Vamos enviar um código para o teu email — sem passwords.
            </Text>

            <TextInput
              style={[s.input, error && s.inputError]}
              placeholder="o.teu@email.pt"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={v => { setEmail(v); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={handleRequestOTP}
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={s.btnText}>Receber código →</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <>
            <Text style={s.title}>Verifica o teu email</Text>
            <Text style={s.subtitle}>
              Enviámos um código de 6 dígitos para{"\n"}
              <Text style={{ color: C.text, fontWeight: "600" }}>{email}</Text>
            </Text>

            {/* OTP boxes */}
            <View style={s.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={r => (otpRefs.current[i] = r)}
                  style={[s.otpBox, digit && s.otpBoxFilled]}
                  value={digit}
                  onChangeText={v => handleOtpChange(v.slice(-1), i)}
                  onKeyPress={e => handleOtpBackspace(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={s.btnText}>Confirmar</Text>
              }
            </TouchableOpacity>

            {/* Reenviar */}
            <TouchableOpacity
              style={s.resendBtn}
              onPress={() => { setStep("email"); setOtp(["","","","","",""]); setError(""); }}
            >
              <Text style={s.resendText}>Não recebeste? Voltar</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  inner:        { flex: 1, padding: 28, justifyContent: "center" },
  logo:         { fontSize: 32, fontWeight: "800", color: C.text, marginBottom: 4 },
  tagline:      { fontSize: 14, color: C.muted, marginBottom: 48 },
  title:        { fontSize: 22, fontWeight: "700", color: C.text, marginBottom: 8 },
  subtitle:     { fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 28 },
  input:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, fontSize: 16, color: C.text, marginBottom: 8 },
  inputError:   { borderColor: C.danger },
  error:        { color: C.danger, fontSize: 13, marginBottom: 12 },
  btn:          { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText:      { color: "white", fontWeight: "700", fontSize: 16 },
  otpRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  otpBox:       { width: 46, height: 56, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, textAlign: "center", fontSize: 24, fontWeight: "700", color: C.text },
  otpBoxFilled: { borderColor: C.accent, backgroundColor: "rgba(37,99,235,0.1)" },
  resendBtn:    { alignItems: "center", marginTop: 20 },
  resendText:   { color: C.muted, fontSize: 14 },
});
