import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Historial de Fallas
      </Text>

      <View style={styles.card}>
        <Text style={styles.brand}>
          RTX 4060
        </Text>

        <Text style={styles.failures}>
          12 fallas registradas
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.brand}>
          HyperX Cloud II
        </Text>

        <Text style={styles.failures}>
          8 fallas registradas
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.brand}>
          Redragon Kumara
        </Text>

        <Text style={styles.failures}>
          5 fallas registradas
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

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  brand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },

  failures: {
    marginTop: 10,
    color: '#718096',
    fontSize: 15,
  },
});