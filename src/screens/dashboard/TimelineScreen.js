import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

export default function TimelineScreen() {

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const estados = [
    'Equipo recibido',
    'En diagnóstico',
    'Garantía aprobada',
    'Enviado al cliente',
  ];

  useFocusEffect(
    useCallback(() => {

      const cargarTickets = async () => {

        try {

          const ticketsGuardados =
            await AsyncStorage.getItem('@tickets_final');

          if (ticketsGuardados) {

            const parsedTickets =
              JSON.parse(ticketsGuardados);

            setTickets(parsedTickets);

            if (parsedTickets.length > 0) {
              setSelectedTicket(parsedTickets[0]);
            }
          }

        } catch (error) {
          console.error(error);
        }
      };

      cargarTickets();

    }, [])
  );

  const obtenerIndiceEstado = (estado) => {

    switch (estado) {

      case 'Equipo recibido':
        return 0;

      case 'En diagnóstico':
        return 1;

      case 'Garantía aprobada':
        return 2;

      case 'Enviado al cliente':
        return 3;

      default:
        return 0;
    }
  };

  if (tickets.length === 0) {

    return (
      <View style={styles.emptyState}>

        <Text style={styles.emptyIcon}>📍</Text>

        <Text style={styles.emptyTitle}>
          No hay tickets registrados
        </Text>

        <Text style={styles.emptyDesc}>
          Los seguimientos aparecerán aquí.
        </Text>

      </View>
    );
  }

  const estadoActual =
    obtenerIndiceEstado(selectedTicket?.estado);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Seguimiento de Casos
      </Text>

      {/* LISTA DE TICKETS */}

      <FlatList
        horizontal
        data={tickets}
        keyExtractor={(item) => item.id}

        showsHorizontalScrollIndicator={false}

        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.ticketCard,

              selectedTicket?.id === item.id &&
              styles.ticketSelected,
            ]}

            onPress={() => setSelectedTicket(item)}
          >

            <Text style={styles.ticketTitle}>
              {item.equipo}
            </Text>

            <Text style={styles.ticketStatus}>
              {item.estado}
            </Text>

          </TouchableOpacity>

        )}
      />

      {/* DETALLE */}

      {selectedTicket && (

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.detailCard}>

            <Text style={styles.label}>
              Equipo:
            </Text>

            <Text style={styles.value}>
              {selectedTicket.equipo}
            </Text>

            <Text style={styles.label}>
              Descripción:
            </Text>

            <Text style={styles.value}>
              {selectedTicket.descripcion}
            </Text>

            <Text style={styles.label}>
              Fecha:
            </Text>

            <Text style={styles.value}>
              {selectedTicket.fecha}
            </Text>

          </View>

          {/* TIMELINE */}

          {estados.map((estado, index) => (

            <View
              key={index}
              style={[
                styles.step,

                index < estadoActual
                  ? styles.completed
                  : index === estadoActual
                  ? styles.active
                  : styles.pending,
              ]}
            >

              <Text style={styles.stepText}>

                {index < estadoActual
                  ? '✔ '
                  : index === estadoActual
                  ? '🟡 '
                  : '⬜ '}

                {estado}

              </Text>

            </View>

          ))}

        </ScrollView>

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
    marginBottom: 25,
    color: '#1A202C',
  },

  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 15,
    marginBottom: 25,
    width: 180,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },

  ticketSelected: {
    borderColor: '#3182CE',
  },

  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
  },

  ticketStatus: {
    marginTop: 10,
    color: '#718096',
    fontSize: 14,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
  },

  label: {
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 10,
  },

  value: {
    marginTop: 5,
    color: '#4A5568',
    fontSize: 15,
  },

  step: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
  },

  completed: {
    backgroundColor: '#C6F6D5',
  },

  active: {
    backgroundColor: '#FEEBC8',
  },

  pending: {
    backgroundColor: '#E2E8F0',
  },

  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    padding: 20,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 10,
  },

  emptyDesc: {
    color: '#718096',
    textAlign: 'center',
    fontSize: 15,
  },

});