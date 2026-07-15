import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function RecoveryScreen({ navigation, route }) {
  const initialEmail = route?.params?.email || '';
  const [step, setStep] = useState(1);
  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { forgotPassword, verifyOtp, resetPassword, resendOtp, logout, isLoading } = useAuth();
  const otpRef = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electronico');
      return;
    }
    setError('');
    try {
      await forgotPassword(email.trim());
      setStep(2);
      startResendCooldown();
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Ingresa el codigo completo de 6 digitos');
      return;
    }
    setError('');
    try {
      const result = await verifyOtp(email.trim(), otp);
      setResetToken(result.resetToken);
      setStep(3);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendOtp(email.trim());
      startResendCooldown();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Completa todos los campos');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    try {
      await resetPassword(email.trim(), newPassword, resetToken);
      await logout();
      navigation.navigate('Login', { successMessage: 'Contrasena actualizada. Ya puedes iniciar sesion.' });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleOtpChange = (text) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Recuperar contraseña</Text>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? 'Paso 1: Verificar correo' : step === 2 ? 'Paso 2: Codigo de verificacion' : 'Paso 3: Nueva contraseña'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 1 && (
            <>
              <Text style={styles.description}>
                Te enviaremos un codigo de verificacion a tu correo electronico.
              </Text>

              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                editable={false}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Enviar codigo OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.description}>
                Ingresa el codigo de 6 digitos enviado a{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <Text style={styles.label}>Codigo de verificacion</Text>
              <View style={styles.otpRow}>
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.otpBox,
                      otp.length === i && styles.otpBoxFocused,
                    ]}
                    onPress={() => otpRef.current?.focus()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.otpDigit}>{otp[i] || ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                ref={otpRef}
                style={styles.otpHiddenInput}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verificar codigo</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResend}
                disabled={isLoading || resendCooldown > 0}
              >
                <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
                  {resendCooldown > 0
                    ? `Reenviar codigo en ${resendCooldown}s`
                    : 'Reenviar codigo'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.description}>
                Identidad verificada. Escribe tu nueva contraseña.
              </Text>

              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimo 6 caracteres"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isLoading}
              />

              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Cambiar contraseña</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
            <Text style={styles.linkText}>← Volver al inicio de sesion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
  card: {
    width: '85%', backgroundColor: '#FFFFFF', padding: 28,
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', textAlign: 'center', marginBottom: 16 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#CBD5E0', borderWidth: 2, borderColor: '#CBD5E0',
  },
  stepDotActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  stepLine: { width: 30, height: 2, backgroundColor: '#CBD5E0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#1A202C' },
  stepLabel: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emailHighlight: { fontWeight: '600', color: '#1A202C' },
  errorBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FC8181', borderRadius: 6, padding: 10, marginBottom: 16 },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 14, color: '#4A5568', marginBottom: 6, fontWeight: '500' },
  input: {
    width: '100%', height: 46, borderWidth: 1, borderColor: '#CBD5E0',
    borderRadius: 6, paddingHorizontal: 12, marginBottom: 16,
    backgroundColor: '#FFFFFF', color: '#1A202C', fontSize: 15,
  },
  inputReadOnly: { backgroundColor: '#EDF2F7', color: '#718096' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 6 },
  otpBox: {
    width: 44, height: 50, borderWidth: 1.5, borderColor: '#CBD5E0',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  otpBoxFocused: { borderColor: '#1A202C', backgroundColor: '#FFFFFF' },
  otpDigit: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  otpHiddenInput: {
    position: 'absolute', width: 1, height: 1, opacity: 0,
  },
  button: {
    width: '100%', height: 48, backgroundColor: '#1A202C',
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resendText: { color: '#4A5568', textAlign: 'center', textDecorationLine: 'underline', fontSize: 14, marginBottom: 16 },
  resendTextDisabled: { color: '#A0AEC0', textDecorationLine: 'none' },
  linkText: { color: '#4A5568', textAlign: 'center', textDecorationLine: 'underline', fontSize: 14 },
});
