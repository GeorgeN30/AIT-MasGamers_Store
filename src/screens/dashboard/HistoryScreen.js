import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function HistoryScreen() {

  const [fallas] = useState([

    {
      id: '1',
      componente: 'RTX 4060',
      cantidad: 12,
    },

    {
      id: '2',
      componente: 'HyperX Cloud II',
      cantidad: 8,
    },

    {
      id: '3',
      componente: 'Redragon Kumara',
      cantidad: 5,
    },

    {
      id: '4',
      componente: 'Ryzen 7 5800X',
      cantidad: 3,
    },

  ]);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Historial de Fallas
      </Text>

      <FlatList
        data={fallas}
        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.component}>
              {item.componente}
            </Text>

            <Text style={styles.count}>
              {item.cantidad} fallas registradas
            </Text>

          </View>
        )}
      />

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

  component: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },

  count: {
    marginTop: 10,
    fontSize: 15,
    color: '#718096',
  },

});