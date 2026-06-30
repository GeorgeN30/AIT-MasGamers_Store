import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchActivity = async () => {
        try {
          const data = await ticketService.getRecentActivity();
          setRecentLogs(data.logs || []);
        } catch {
          setRecentLogs([]);
        } finally {
          setLoadingActivity(false);
        }
      };
      fetchActivity();
    }, [])
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.greeting}>Hola, {user?.name}</Text>
          <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.newTicketButton}
        onPress={() => navigation.navigate('NewTicket')}
      >
        <Text style={styles.newTicketText}>+ Crear nuevo ticket</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Actividad Reciente</Text>
      {loadingActivity ? (
        <ActivityIndicator size="small" color="#1A202C" style={{ marginTop: 20 }} />
      ) : recentLogs.length > 0 ? (
        <FlatList
          data={recentLogs}
          keyExtractor={(item) => item.id}
          style={styles.activityList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.activityItem}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.ticketId })}
            >
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText} numberOfLines={1}>
                  {item.equipo}: {item.estado_anterior ? `${item.estado_anterior} → ${item.estado_nuevo}` : item.estado_nuevo}
                </Text>
                <Text style={styles.activityMeta}>
                  {item.changedByName} · {item.created_at?.substring(0, 10)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>|</Text>
          <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
          <Text style={styles.emptyDesc}>Crea un ticket para empezar</Text>
        </View>
      )}

      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Text style={styles.menuText}>Gestionar Usuarios</Text>
        </TouchableOpacity>
      )}

      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Text style={styles.menuText}>Gestionar Usuarios</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 28,
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 14 },
  avatarFallback: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#1A202C', justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  avatarInitial: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  role: { fontSize: 13, color: '#718096', marginTop: 2 },
  newTicketButton: {
    backgroundColor: '#1A202C', borderRadius: 8, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  newTicketText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  activityList: { flex: 1, marginBottom: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  activityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3182CE', marginTop: 5, marginRight: 12 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: '#2D3748' },
  activityMeta: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#718096', textAlign: 'center' },
  logoutButton: { padding: 14, alignItems: 'center' },
  logoutText: { color: '#E53E3E', fontWeight: '600', fontSize: 15 },
  menuButton: { backgroundColor: '#1A202C', padding: 16, borderRadius: 12, marginTop: 15 },
  menuText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
