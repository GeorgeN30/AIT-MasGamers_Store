import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

export default function AdminReportScreen() {
  const { token } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const url = ticketService.downloadReport();

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      if (Platform.OS === 'web') {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `masgamers-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        Alert.alert('Descarga completa', 'El reporte PDF se ha descargado');
      } else {
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        const fileUri = `${FileSystem.documentDirectory}masgamers-report-${new Date().toISOString().split('T')[0]}.pdf`;
        const downloadResumable = FileSystem.createDownloadResumable(
          url, fileUri, { headers: { Authorization: `Bearer ${token}` } }
        );
        const { uri } = await downloadResumable.downloadAsync();
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'MasGamers Report',
        });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reporte de Tickets</Text>
        <Text style={styles.description}>
          Generar un reporte PDF consolidado con:
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>- Tickets resueltos hoy</Text>
          <Text style={styles.listItem}>- Tickets pendientes por estado</Text>
          <Text style={styles.listItem}>- Resumen mensual y estadisticas</Text>
        </View>

        <TouchableOpacity
          style={[styles.generateButton, generating && styles.buttonDisabled]}
          onPress={generateReport}
          disabled={generating}
        >
          {generating ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.loadingText}>Generando reporte PDF...</Text>
            </>
          ) : (
            <Text style={styles.generateButtonText}>Generar Reporte</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  description: { fontSize: 15, color: '#4A5568', marginBottom: 16, lineHeight: 22 },
  list: { marginBottom: 24 },
  listItem: { fontSize: 14, color: '#2D3748', marginBottom: 6, paddingLeft: 8 },
  generateButton: {
    backgroundColor: '#1A202C', padding: 16, borderRadius: 8, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  generateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loadingText: { color: '#FFFFFF', fontSize: 12, marginTop: 6, opacity: 0.8 },
});
