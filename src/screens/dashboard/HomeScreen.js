import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* Perfil del usuario */}
      <View style={styles.profileRow}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
          <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.newTicketButton}
        onPress={() => navigation.navigate('NewTicket')}
      >
        <Text style={styles.newTicketText}>+ Crear nuevo ticket</Text>
      </TouchableOpacity>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎫</Text>
        <Text style={styles.emptyTitle}>No tienes tickets abiertos</Text>
        <Text style={styles.emptyDesc}>Crea un ticket para recibir soporte técnico</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  role: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  newTicketButton: {
    backgroundColor: '#1A202C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  newTicketText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  logoutButton: {
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#E53E3E',
    fontWeight: '600',
    fontSize: 15,
  },
});
