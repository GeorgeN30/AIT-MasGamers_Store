import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Switch, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  // Extraemos el usuario actual y la función que acabamos de crear en el contexto
  const { user, updateProfile } = useAuth();
  
  // Estados locales para los inputs antes de guardar
  const [editName, setEditName] = useState(user?.name || 'Admin MasGamers');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Función para abrir la galería (con la corrección del mediaTypes)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Sintaxis corregida para evitar el WARN
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  // Función para guardar los cambios
  const handleSave = () => {
    if (editName.trim() === '') {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    updateProfile(editName, editAvatar);
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  return (
    <View style={styles.container}>
      
      {/* Sección de Foto de Perfil */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={pickImage}>
          {editAvatar ? (
            <Image source={{ uri: editAvatar }} style={styles.avatar} />
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

      {/* Sección de Información del Perfil */}
      <View style={styles.infoSection}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={editName}
          onChangeText={setEditName}
          placeholder="Escribe tu nombre"
        />
      </View>

      {/* Otras Preferencias */}
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

      {/* Botón Guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  headerSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A202C', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' },
  changePhotoText: { marginTop: 10, color: '#718096', fontSize: 14 },
  infoSection: { marginBottom: 30 },
  label: { fontSize: 16, color: '#1A202C', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16 },
  preferencesSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 15 },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  preferenceText: { fontSize: 16, color: '#1A202C' },
  saveButton: { backgroundColor: '#1A202C', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});