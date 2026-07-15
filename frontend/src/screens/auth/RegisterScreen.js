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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Ingresa un correo electronico valido');
      return;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contrasena debe contener al menos una mayuscula');
      return;
    }
    if (!/\d/.test(password)) {
      setError('La contrasena debe contener al menos un numero');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('La contrasena debe contener al menos un caracter especial (!@#$%&*+? etc)');
      return;
    }
    setError('');
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      // Al registrarse, vuelve al Login con mensaje de exito
      navigation.navigate('Login', { successMessage: '¡Cuenta creada! Ya puedes iniciar sesion.' });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MG</Text>
          </View>
          <Text style={styles.title}>Crear cuenta</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

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

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimo 6 caracteres"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesion</Text>
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
  logoContainer: {
    width: 64, height: 64, borderWidth: 2, borderColor: '#1A202C',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginBottom: 12, borderRadius: 8,
  },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', textAlign: 'center', marginBottom: 24 },
  errorBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FC8181', borderRadius: 6, padding: 10, marginBottom: 16 },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 14, color: '#4A5568', marginBottom: 4, fontWeight: '500' },
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
