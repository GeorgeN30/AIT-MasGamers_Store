import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function TimelineScreen() {

  const estados = [
    'Equipo recibido',
    'En diagnóstico',
    'Garantía aprobada',
    'Enviado al cliente',
  ];

  const [estadoActual, setEstadoActual] = useState(1);

  const avanzarEstado = () => {

    if (estadoActual < estados.length - 1) {
      setEstadoActual(estadoActual + 1);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Seguimiento en Tiempo Real
      </Text>

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

      <TouchableOpacity
        style={styles.button}
        onPress={avanzarEstado}
      >
        <Text style={styles.buttonText}>
          Actualizar Estado
        </Text>
      </TouchableOpacity>

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

  step: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
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

  button: {
    marginTop: 20,
    backgroundColor: '#1A202C',
    padding: 18,
    borderRadius: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

});