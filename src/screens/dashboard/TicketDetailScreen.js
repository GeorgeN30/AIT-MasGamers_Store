import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Pantalla placeholder — se desarrollará en el siguiente sprint
export default function TicketDetailScreen({ route }) {
  const { ticketId } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detalle del Ticket #{ticketId}</Text>
      <Text style={styles.sub}>Próximamente...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
  sub: { fontSize: 14, color: '#718096', marginTop: 8 },
});
