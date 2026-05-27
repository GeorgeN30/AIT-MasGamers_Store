import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function NewTicketScreen({ navigation }) {
  const [equipo, setEquipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categoria, setCategoria] = useState('Soporte Técnico');

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

const guardarTicket = async () => {
    if (!equipo.trim() || !descripcion.trim()) {
      Alert.alert('Campos vacíos', 'Por favor, ingresa el componente y el detalle de la falla.');
      return;
    }

     const nuevoTicket = {
    id: Date.now().toString(),
    codigo: `MG-${Date.now().toString().slice(-5)}`,
    categoria,
    equipo: equipo.trim(),
    descripcion: descripcion.trim(),
    imageUri,
    estado: 'Equipo recibido',
    prioridad: 'Media',
    fecha: new Date().toLocaleDateString('es-PE'),
    };

    try {
      const ticketsPrevios = await AsyncStorage.getItem('@tickets_final');
      const ticketsParseados = ticketsPrevios ? JSON.parse(ticketsPrevios) : [];
      
      ticketsParseados.push(nuevoTicket);
      await AsyncStorage.setItem('@tickets_final', JSON.stringify(ticketsParseados));
      
      Alert.alert('Éxito', '¡Incidencia guardada localmente!');
      navigation.goBack(); 
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la incidencia.');
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Categoría del ticket:</Text>
      <View style={styles.categoryContainer}>
        <TouchableOpacity 
          style={[styles.categoryBtn, categoria === 'Soporte Técnico' && styles.categoryBtnActive]} 
          onPress={() => setCategoria('Soporte Técnico')}
        >
          <Text style={[styles.categoryText, categoria === 'Soporte Técnico' && styles.categoryTextActive]}>
            Soporte Técnico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryBtn, categoria === 'Ventas' && styles.categoryBtnActive]} 
          onPress={() => setCategoria('Ventas')}
        >
          <Text style={[styles.categoryText, categoria === 'Ventas' && styles.categoryTextActive]}>
            Ventas / Atención
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Equipo / Componente defectuoso:</Text>
      <TextInput
        style={styles.input}
        placeholder={categoria === 'Soporte Técnico' ? "Ej: Teclado Mecánico, GPU..." : "Ej: Pedido #1234, Factura..."}
        placeholderTextColor="#999"
        value={equipo}
        onChangeText={setEquipo}
      />

      <Text style={styles.label}>Descripción del problema:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={categoria === 'Soporte Técnico' ? "Escribe qué falla presenta..." : "Explica tu duda o problema con la compra..."}
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
        <Text style={styles.imageButtonText}>
          {imageUri ? 'Cambiar Foto' : 'Adjuntar Foto de Evidencia'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={guardarTicket}>
        <Text style={styles.submitButtonText}>Enviar Ticket de Soporte</Text>
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

  imageButton: { backgroundColor: '#E2E8F0', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#A0AEC0' },
  imageButtonText: { color: '#1A202C', fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 220, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  submitButton: { backgroundColor: '#1A202C', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
