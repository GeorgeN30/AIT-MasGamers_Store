import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TimelineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Seguimiento del Equipo
      </Text>

      <View style={styles.stepCompleted}>
        <Text style={styles.stepText}>
          ✔ Equipo recibido
        </Text>
      </View>

      <View style={styles.stepCompleted}>
        <Text style={styles.stepText}>
          ✔ En diagnóstico
        </Text>
      </View>

      <View style={styles.stepActive}>
        <Text style={styles.stepText}>
          🟡 Garantía aprobada
        </Text>
      </View>

      <View style={styles.stepPending}>
        <Text style={styles.stepText}>
          ⬜ Enviado al cliente
        </Text>
      </View>
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

  stepCompleted: {
    backgroundColor: '#C6F6D5',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },

  stepActive: {
    backgroundColor: '#FEEBC8',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },

  stepPending: {
    backgroundColor: '#E2E8F0',
    padding: 18,
    borderRadius: 12,
  },

  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});