import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HistoryScreen() {
  const [tickets, setTickets] = useState([]);

  // Recargar el historial de la memoria cada vez que entras a esta pestaña
  useFocusEffect(
    useCallback(() => {
      const cargarHistorial = async () => {
        try {
          const ticketsGuardados = await AsyncStorage.getItem('@tickets_final');
          if (ticketsGuardados) {
            setTickets(JSON.parse(ticketsGuardados));
          }
        } catch (error) {
          console.error('Error al cargar el historial:', error);
        }
      };
      cargarHistorial();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Fallas</Text>

      {/* Si hay tickets los muestra, si está vacío muestra un mensaje */}

      {tickets.length > 0 ? (
        
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (

            <View style={styles.card}>

              <View style={styles.ticketHeader}>
                <Text style={styles.component}>{item.equipo}</Text>
                <Text style={styles.date}>{item.fecha}</Text>
              </View>
              
              <Text style={styles.description}>{item.descripcion}</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado actual:</Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.estado}</Text>
                </View>

              </View>

            </View>

          )}

          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Historial vacío</Text>
          <Text style={styles.emptyDesc}>Aún no has registrado ninguna incidencia térmica o de hardware.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1A202C',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  component: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  description: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#718096',
  },
  badge: {
    backgroundColor: '#EBF4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    color: '#3182CE',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});
