import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const ESTADOS = ['Recibido', 'En diagn├│stico', 'En reparaci├│n', 'Esperando repuestos', 'Reparado', 'Enviado al cliente', 'Cerrado'];

export default function TicketDetailScreen({ route }) {
  const { ticketId } = route.params || {};
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketData, logsData] = await Promise.all([
          ticketService.getById(ticketId),
          ticketService.getLogs(ticketId),
        ]);
        setTicket(ticketData.ticket);
        setLogs(logsData.logs);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const changeStatus = async (estado) => {
    try {
      const result = await ticketService.updateStatus(ticketId, estado);
      setTicket(result.ticket);
      const logsData = await ticketService.getLogs(ticketId);
      setLogs(logsData.logs);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const playAudio = async () => {
    if (!ticket?.audioUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlaying(false);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: ticket.audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setSound(null);
          setPlaying(false);
        }
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const currentIndex = ESTADOS.indexOf(ticket?.estado);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A202C" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ticket no encontrado</Text>
      </View>
    );
  }

  const baseUrl = ticket.imageUri || ticket.audioUri
    ? ticket.imageUri?.startsWith('/uploads')
      ? `http://localhost:3000${ticket.imageUri}`
      : ticket.imageUri
    : null;

  const imageFullUrl = ticket.imageUri?.startsWith('/uploads')
    ? `http://localhost:3000${ticket.imageUri}`
    : ticket.imageUri;

  const audioFullUrl = ticket.audioUri?.startsWith('/uploads')
    ? `http://localhost:3000${ticket.audioUri}`
    : ticket.audioUri;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.equipo}>{ticket.equipo}</Text>
        <Text style={styles.categoria}>{ticket.categoria}</Text>
        <Text style={styles.descripcion}>{ticket.descripcion}</Text>
        <Text style={styles.date}>Creado: {ticket.created_at?.substring(0, 10)}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Estado Actual</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{ticket.estado}</Text>
        </View>
      </View>

      {ticket.latitude && ticket.longitude && (
        <TouchableOpacity
          style={styles.mediaCard}
          onPress={() => Linking.openURL(`https://maps.google.com/maps?q=${ticket.latitude},${ticket.longitude}`)}
        >
          <Text style={styles.mediaText}>­ƒôì Ubicaci├│n: {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</Text>
        </TouchableOpacity>
      )}

      {imageFullUrl && (
        <View style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>­ƒôÀ Evidencia</Text>
          <Image source={{ uri: imageFullUrl }} style={styles.imagePreview} resizeMode="contain" />
        </View>
      )}

      {audioFullUrl && (
        <View style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>­ƒÄñ Nota de Voz</Text>
          <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
            <Text style={styles.audioButtonText}>
              {playing ? 'ÔÅ╣ Detener' : 'ÔûÂ Reproducir'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Cambiar Estado</Text>
          <View style={styles.statusGrid}>
            {ESTADOS.map((estado, index) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.statusBtn,
                  ticket.estado === estado && styles.statusBtnActive,
                  index < currentIndex && styles.statusBtnPast,
                ]}
                onPress={() => changeStatus(estado)}
              >
                <Text style={[
                  styles.statusBtnText,
                  (ticket.estado === estado || index < currentIndex) && styles.statusBtnTextActive,
                ]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Historial</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <View style={styles.logDot} />
          <View style={styles.logContent}>
            <Text style={styles.logText}>
              {log.estado_anterior ? `${log.estado_anterior} ÔåÆ ${log.estado_nuevo}` : log.estado_nuevo}
            </Text>
            <Text style={styles.logMeta}>
              {log.changedByName} ┬À {log.created_at?.substring(0, 10)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  errorText: { color: '#E53E3E', fontSize: 16 },
  card: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  equipo: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginBottom: 4 },
  categoria: { fontSize: 13, color: '#718096', marginBottom: 12 },
  descripcion: { fontSize: 15, color: '#4A5568', marginBottom: 12, lineHeight: 22 },
  date: { fontSize: 12, color: '#A0AEC0' },
  statusCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  statusBadge: { backgroundColor: '#EBF4FF', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12 },
  statusText: { color: '#3182CE', fontSize: 14, fontWeight: 'bold' },
  mediaCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  mediaText: { fontSize: 14, color: '#4A5568' },
  imagePreview: { width: '100%', height: 250, borderRadius: 8, marginTop: 8 },
  audioButton: { backgroundColor: '#1A202C', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  audioButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  adminSection: { marginBottom: 20 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E0' },
  statusBtnActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  statusBtnPast: { backgroundColor: '#C6F6D5', borderColor: '#68D391' },
  statusBtnText: { fontSize: 12, color: '#4A5568' },
  statusBtnTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  logItem: { flexDirection: 'row', marginBottom: 12 },
  logDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3182CE', marginTop: 5, marginRight: 12 },
  logContent: { flex: 1 },
  logText: { fontSize: 14, color: '#2D3748' },
  logMeta: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
});
