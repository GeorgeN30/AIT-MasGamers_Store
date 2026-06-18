import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../../services/ticketService';

export default function HistoryScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadTickets = async () => {
        try {
          const data = await ticketService.getAll();
          setTickets(data.tickets);
        } catch (e) {
          setError(e.message);
        }
      };
      loadTickets();
    }, [])
  );

  const getMediaIcons = (ticket) => {
    const icons = [];
    if (ticket.imageUri) icons.push('­ƒôÀ');
    if (ticket.audioUri) icons.push('­ƒÄñ');
    if (ticket.latitude && ticket.longitude) icons.push('­ƒôì');
    return icons;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : tickets.length > 0 ? (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.component}>{item.equipo}</Text>
                <Text style={styles.date}>{item.created_at?.substring(0, 10)}</Text>
              </View>
              <Text style={styles.description}>{item.descripcion}</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.estado}</Text>
                </View>
              </View>
              {getMediaIcons(item).length > 0 && (
                <View style={styles.mediaRow}>
                  {getMediaIcons(item).map((icon, i) => (
                    <Text key={i} style={styles.mediaIcon}>{icon}</Text>
                  ))}
                  <Text style={styles.mediaLabel}>Archivos adjuntos</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>­ƒôè</Text>
          <Text style={styles.emptyTitle}>Sin tickets</Text>
          <Text style={styles.emptyDesc}>A├║n no has registrado ninguna incidencia.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#1A202C' },
  errorBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FC8181', borderRadius: 6, padding: 10, marginBottom: 16 },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  component: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', flex: 1 },
  date: { fontSize: 13, color: '#A0AEC0' },
  description: { fontSize: 15, color: '#4A5568', marginBottom: 15 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 12,
  },
  statusLabel: { fontSize: 14, color: '#718096' },
  badge: { backgroundColor: '#EBF4FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { color: '#3182CE', fontSize: 13, fontWeight: 'bold' },
  mediaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  mediaIcon: { fontSize: 16 },
  mediaLabel: { fontSize: 12, color: '#A0AEC0', marginLeft: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#718096', textAlign: 'center' },
});
