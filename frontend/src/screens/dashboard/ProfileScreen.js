import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Switch, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { getCachedImage } from '../../services/imageCacheService';
import { ticketService } from '../../services/ticketService';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword, isLoading } = useAuth();

  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || null);
  const [cachedAvatar, setCachedAvatar] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  React.useEffect(() => {
    if (editAvatar && editAvatar !== user?.avatar) return;
    if (user?.avatar) {
      getCachedImage(user.avatar).then(setCachedAvatar);
    }
  }, [user?.avatar]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (editName.trim() === '') {
      Alert.alert('Error', 'El nombre no puede estar vacio');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = editAvatar;
      if (editAvatar && !editAvatar.startsWith('/uploads') && !editAvatar.startsWith('http')) {
        setUploading(true);
        try {
          const result = await ticketService.uploadMedia(editAvatar, 'avatar');
          avatarUrl = result.url;
        } finally {
          setUploading(false);
        }
      }
      await updateProfile(editName.trim(), avatarUrl);
      Alert.alert('Exito', 'Perfil actualizado correctamente');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contrasena debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contrasenas no coinciden');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Exito', 'Contrasena actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={pickImage}>
          {editAvatar ? (
            <Image source={{ uri: editAvatar.startsWith('file://') ? editAvatar : (cachedAvatar || editAvatar) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {editName ? editName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Toca la imagen para cambiarla</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={editName}
          onChangeText={setEditName}
          placeholder="Escribe tu nombre"
        />
      </View>

      <TouchableOpacity
        style={styles.sectionToggle}
        onPress={() => setShowPasswordSection(!showPasswordSection)}
      >
        <Text style={styles.sectionToggleText}>
          {showPasswordSection ? 'Ocultar' : 'Cambiar contrasena'}
        </Text>
      </TouchableOpacity>

      {showPasswordSection && (
        <View style={styles.passwordSection}>
          <Text style={styles.label}>Contrasena actual</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu contrasena actual"
            placeholderTextColor="#999"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={styles.label}>Nueva contrasena</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimo 6 caracteres"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.label}>Confirmar nueva contrasena</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite la nueva contrasena"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.passwordButton, changingPassword && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.passwordButtonText}>Actualizar contrasena</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Otras Preferencias</Text>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceText}>Notificaciones de tickets</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#1A202C' }}
            thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        )}
        {saving && uploading && (
          <Text style={styles.uploadingText}>Subiendo imagen...</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  headerSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A202C', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' },
  changePhotoText: { marginTop: 10, color: '#718096', fontSize: 14 },
  infoSection: { marginBottom: 20 },
  label: { fontSize: 16, color: '#1A202C', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16 },
  sectionToggle: { marginBottom: 20 },
  sectionToggleText: { color: '#3182CE', fontSize: 16, fontWeight: '600' },
  passwordSection: { marginBottom: 20, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordButton: { backgroundColor: '#1A202C', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  passwordButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  preferencesSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 15 },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  preferenceText: { fontSize: 16, color: '#1A202C' },
  saveButton: { backgroundColor: '#1A202C', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6 },
  uploadingText: { color: '#FFFFFF', fontSize: 12, marginTop: 4, opacity: 0.8 },
});