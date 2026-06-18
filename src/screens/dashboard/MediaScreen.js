import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ticketService } from '../../services/ticketService';

export default function MediaScreen() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permiso denegado');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const result = await ticketService.uploadMedia(uri);
      Alert.alert('Subida', 'Imagen subida correctamente');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión Multimedia</Text>

      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Subiendo...' : '📷 Seleccionar Imagen'}
        </Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}

      <Text style={styles.description}>
        Adjunta evidencia multimedia de la falla.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#1A202C' },
  button: { backgroundColor: '#1A202C', padding: 18, borderRadius: 12, marginBottom: 25 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  preview: { width: '100%', height: 300, borderRadius: 15, marginBottom: 20 },
  description: { color: '#4A5568', textAlign: 'center', fontSize: 15 },
});
