import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { ticketService } from '../../services/ticketService';
import { locationService } from '../../services/locationService';

export default function NewTicketScreen({ navigation }) {
  const [equipo, setEquipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categoria, setCategoria] = useState('Soporte T├®cnico');
  const [location, setLocation] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galer├¡a.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    const loc = await locationService.getCurrentPosition();
    if (loc) {
      setLocation(loc);
      Alert.alert('Ubicaci├│n', 'Ubicaci├│n agregada correctamente');
    } else {
      Alert.alert('Error', 'No se pudo obtener la ubicaci├│n');
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso al micr├│fono.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudo iniciar la grabaci├│n');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
  };

  const submitTicket = async () => {
    if (!equipo.trim() || !descripcion.trim()) {
      Alert.alert('Campos vac├¡os', 'Ingresa el equipo y el detalle de la falla.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUri = null;
      if (imageUri) {
        try {
          const uploadResult = await ticketService.uploadMedia(imageUri);
          uploadedImageUri = uploadResult.url;
        } catch (uploadError) {
          console.warn('Upload failed, creating ticket without image:', uploadError.message);
        }
      }

      let uploadedAudioUri = null;
      if (audioUri) {
        try {
          const uploadResult = await ticketService.uploadMedia(audioUri);
          uploadedAudioUri = uploadResult.url;
        } catch (uploadError) {
          console.warn('Upload failed, creating ticket without audio:', uploadError.message);
        }
      }

      await ticketService.create({
        categoria,
        equipo: equipo.trim(),
        descripcion: descripcion.trim(),
        imageUri: uploadedImageUri,
        audioUri: uploadedAudioUri,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      });

      Alert.alert('├ëxito', 'Ticket creado correctamente');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Categor├¡a:</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryBtn, categoria === 'Soporte T├®cnico' && styles.categoryBtnActive]}
          onPress={() => setCategoria('Soporte T├®cnico')}
        >
          <Text style={[styles.categoryText, categoria === 'Soporte T├®cnico' && styles.categoryTextActive]}>
            Soporte T├®cnico
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryBtn, categoria === 'Ventas' && styles.categoryBtnActive]}
          onPress={() => setCategoria('Ventas')}
        >
          <Text style={[styles.categoryText, categoria === 'Ventas' && styles.categoryTextActive]}>
            Ventas / Atenci├│n
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Equipo / Componente:</Text>
      <TextInput
        style={styles.input}
        placeholder={categoria === 'Soporte T├®cnico' ? "Ej: Teclado Mec├ínico, GPU..." : "Ej: Pedido #1234, Factura..."}
        placeholderTextColor="#999"
        value={equipo}
        onChangeText={setEquipo}
      />

      <Text style={styles.label}>Descripci├│n del problema:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={categoria === 'Soporte T├®cnico' ? "Describe la falla..." : "Explica tu problema..."}
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.sensorButton} onPress={pickImage}>
        <Text style={styles.sensorButtonText}>
          {imageUri ? '­ƒôÀ Cambiar Foto' : '­ƒôÀ Adjuntar Foto'}
        </Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />}

      <TouchableOpacity style={styles.sensorButton} onPress={getLocation}>
        <Text style={styles.sensorButtonText}>
          {location ? '­ƒôì Ubicaci├│n agregada' : '­ƒôì Agregar Ubicaci├│n GPS'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sensorButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.sensorButtonText}>
          {isRecording ? 'ÔÅ╣ Detener Grabaci├│n' : audioUri ? '­ƒÄñ Audio grabado' : '­ƒÄñ Grabar Nota de Voz'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={submitTicket}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Enviando...' : 'Enviar Ticket'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F5F7' },
  label: { fontSize: 16, marginBottom: 8, color: '#1A202C', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcdde1', borderRadius: 8, padding: 12, marginBottom: 15, color: '#1A202C' },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryBtn: { flex: 1, backgroundColor: '#E2E8F0', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#CBD5E0' },
  categoryBtnActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  categoryText: { color: '#4A5568', fontWeight: '600', fontSize: 14 },
  categoryTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  sensorButton: { backgroundColor: '#E2E8F0', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#A0AEC0' },
  sensorButtonText: { color: '#1A202C', fontWeight: 'bold' },
  recordingButton: { backgroundColor: '#FED7D7', borderColor: '#FC8181' },
  imagePreview: { width: '100%', height: 220, borderRadius: 8, marginBottom: 15 },
  submitButton: { backgroundColor: '#1A202C', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
