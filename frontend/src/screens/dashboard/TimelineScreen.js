import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../../services/ticketService';

const ESTADOS_ORDER = ['Recibido', 'En diagnostico', 'En reparacion', 'Esperando repuestos', 'Reparado', 'Enviado al cliente', 'Cerrado'];

export default function TimelineScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const data = await ticketService.getAll();
          setTickets(data.tickets);
        } catch (e) {
          console.error(e);
        }
      };
      load();
    }, [])
  );

  const getStepIndex = (estado) => ESTADOS_ORDER.indexOf(estado);

  const getStepStyle = (stepIdx, currentIdx) => {
    if (stepIdx < currentIdx) return styles.completed;
    if (stepIdx === currentIdx) return styles.active;
    return styles.pending;
  };

  const currentTicket = tickets.length > 0 ? tickets[0] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento</Text>

      {currentTicket ? (
        <>
          <TouchableOpacity
            style={styles.ticketInfo}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: currentTicket.id })}
          >
            <Text style={styles.ticketName}>{currentTicket.equipo}</Text>
            <Text style={styles.ticketStatus}>Estado: {currentTicket.estado}</Text>
          </TouchableOpacity>

          <View style={styles.timeline}>
            {ESTADOS_ORDER.map((estado, index) => {
              const currentIdx = getStepIndex(currentTicket.estado);
              return (
                <View key={estado} style={styles.stepRow}>
                  <View style={[styles.stepDot, getStepStyle(index, currentIdx)]} />
                  {index < ESTADOS_ORDER.length - 1 && (
                    <View style={[styles.stepLine, index < currentIdx ? styles.completedLine : styles.pendingLine]} />
                  )}
                  <Text style={[styles.stepText, index <= currentIdx && styles.stepTextActive]}>
                    {estado}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyTitle}>Sin seguimiento</Text>
          <Text style={styles.emptyDesc}>Crea un ticket para ver su progreso</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#1A202C' },
  ticketInfo: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24,
  },
  ticketName: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 4 },
  ticketStatus: { fontSize: 14, color: '#718096' },
  timeline: { paddingLeft: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  stepDot: { width: 16, height: 16, borderRadius: 8, marginRight: 14, marginTop: 2, borderWidth: 3 },
  completed: { backgroundColor: '#38A169', borderColor: '#38A169' },
  active: { backgroundColor: '#D69E2E', borderColor: '#D69E2E' },
  pending: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E0' },
  stepLine: { position: 'absolute', left: 7, top: 18, width: 2, height: 32 },
  completedLine: { backgroundColor: '#38A169' },
  pendingLine: { backgroundColor: '#CBD5E0' },
  stepText: { fontSize: 15, color: '#A0AEC0', paddingVertical: 10, marginLeft: 4 },
  stepTextActive: { color: '#2D3748', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#718096', textAlign: 'center' },
});
