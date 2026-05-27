import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

export default function HistoryScreen() {

  const [tickets, setTickets] = useState([]);

  useFocusEffect(
    useCallback(() => {

      cargarHistorial();

    }, [])
  );

  const cargarHistorial = async () => {

    try {

      const ticketsGuardados =
        await AsyncStorage.getItem('@tickets_final');

      if (ticketsGuardados) {
        setTickets(JSON.parse(ticketsGuardados));
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ELIMINAR TICKET

  const eliminarTicket = (codigo) => {

  Alert.alert(
    'Eliminar incidencia',
    '¿Deseas eliminar este registro?',

    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },

      {
        text: 'Eliminar',

        onPress: async () => {

          try {

            const nuevosTickets =
              tickets.filter(
                (ticket) =>
                  ticket.codigo !== codigo
              );

            setTickets(nuevosTickets);

            await AsyncStorage.setItem(
              '@tickets_final',
              JSON.stringify(nuevosTickets)
            );

          } catch (error) {
            console.error(error);
          }
        },

        style: 'destructive',
      },
    ]
  );
};

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Historial de Fallas
      </Text>

      {tickets.length > 0 ? (

        <FlatList
          data={tickets}
          keyExtractor={(item, index) => index.toString()}

          renderItem={({ item }) => (

            <View style={styles.card}>

              <View style={styles.ticketHeader}>

              <View style={{ flex: 1 }}>

              <Text style={styles.component}>
                    {item.equipo}
              </Text>

              <Text style={styles.ticketCode}>
                  {item.codigo}
              </Text>

              </View>

              <Text style={styles.date}>
                 {item.fecha}
              </Text>

              </View>

              <Text style={styles.description}>
                {item.descripcion}
              </Text>

              <View style={styles.statusRow}>

                <View>

                  <Text style={styles.statusLabel}>
                    Estado actual
                  </Text>

                  <View style={styles.badge}>

                    <Text style={styles.badgeText}>
                      {item.estado}
                    </Text>

                  </View>

                </View>

                {/* BOTÓN ELIMINAR */}

                <TouchableOpacity
                  style={styles.deleteButton}

                  onPress={() =>
                    eliminarTicket(item.codigo)
                  }
                >

                  <Text style={styles.deleteText}>
                    Eliminar
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

          )}

          showsVerticalScrollIndicator={false}
        />

      ) : (

        <View style={styles.emptyState}>

          <Text style={styles.emptyIcon}>
            📊
          </Text>

          <Text style={styles.emptyTitle}>
            Historial vacío
          </Text>

          <Text style={styles.emptyDesc}>
            Aún no has registrado incidencias.
          </Text>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 12,
  },

  statusLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },

  badge: {
    backgroundColor: '#EBF4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: '#3182CE',
    fontSize: 13,
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  deleteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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