import React, { useState } from 'react';
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

/**
 * RecoveryScreen — Flujo en 2 pasos:
 * Paso 1: Usuario ingresa su correo y palabra de seguridad → se verifica
 * Paso 2: Si coincide, puede escribir su nueva contraseña
 */
export default function RecoveryScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = verificar, 2 = nueva contraseña
  const [email, setEmail] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { verifySecurityWord, resetPassword, isLoading } = useAuth();

  // PASO 1: Verificar correo + palabra de seguridad
  const handleVerify = async () => {
    if (!email.trim() || !securityWord.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    setError('');
    try {
      await verifySecurityWord(email.trim(), securityWord.trim());
      setStep(2); // Verificado → avanza al paso 2
    } catch (e) {
      setError(e.message);
    }
  };

  // PASO 2: Cambiar contraseña
  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Por favor completa todos los campos');
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
      await resetPassword(email.trim(), securityWord.trim(), newPassword);
      navigation.navigate('Login', { successMessage: '¡Contraseña actualizada! Ya puedes iniciar sesion.' });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          <Text style={styles.title}>Recuperar contraseña</Text>

          {/* Indicador de paso */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? 'Paso 1: Verificar identidad' : 'Paso 2: Nueva contraseña'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* PASO 1 */}
          {step === 1 && (
            <>
              <Text style={styles.description}>
                Ingresa tu correo y la palabra de seguridad que usaste al registrarte.
              </Text>

              <Text style={styles.label}>Correo electronico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <Text style={styles.label}>Palabra de seguridad</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu palabra secreta"
                placeholderTextColor="#A0A0A0"
                value={securityWord}
                onChangeText={setSecurityWord}
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verificar identidad</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <>
              <Text style={styles.description}>
                Identidad verificada ✓ Escribe tu nueva contraseña.
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
  stepLine: { width: 40, height: 2, backgroundColor: '#CBD5E0', marginHorizontal: 6 },
  stepLabel: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  errorBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FC8181', borderRadius: 6, padding: 10, marginBottom: 16 },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 14, color: '#4A5568', marginBottom: 6, fontWeight: '500' },
  input: {
    width: '100%', height: 46, borderWidth: 1, borderColor: '#CBD5E0',
    borderRadius: 6, paddingHorizontal: 12, marginBottom: 16,
    backgroundColor: '#FFFFFF', color: '#1A202C', fontSize: 15,
  },
  button: {
    width: '100%', height: 48, backgroundColor: '#1A202C',
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#4A5568', textAlign: 'center', textDecorationLine: 'underline', fontSize: 14 },
});
