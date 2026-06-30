import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { userService } from '../../services/userService';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data.users);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadUsers(); }, [loadUsers]));

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await userService.update(user.id, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const toggleActive = async (user) => {
    const action = user.active ? 'desactivar' : 'restaurar';
    const confirmMsg = user.active
      ? `Desactivar a ${user.name}? Podras restaurarlo despues.`
      : `Restaurar a ${user.name}?`;

    Alert.alert('Confirmar', confirmMsg, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: user.active ? 'Desactivar' : 'Restaurar',
        style: user.active ? 'destructive' : 'default',
        onPress: async () => {
          try {
            if (user.active) {
              await userService.deactivate(user.id);
            } else {
              await userService.restore(user.id);
            }
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, active: user.active ? 0 : 1 } : u));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A202C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion de Usuarios</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.active && styles.cardInactive]}>
            <View style={styles.userHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.badges}>
                  <View style={[styles.roleBadge, item.role === 'admin' && styles.roleBadgeAdmin]}>
                    <Text style={[styles.roleText, item.role === 'admin' && styles.roleTextAdmin]}>
                      {item.role === 'admin' ? 'Admin' : 'Usuario'}
                    </Text>
                  </View>
                  {!item.active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>Inactivo</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => toggleRole(item)}>
                <Text style={styles.actionText}>
                  {item.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, item.active ? styles.dangerButton : styles.successButton]}
                onPress={() => toggleActive(item)}
              >
                <Text style={[styles.actionText, styles.actionTextWhite]}>
                  {item.active ? 'Desactivar' : 'Restaurar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#1A202C' },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  cardInactive: { opacity: 0.6 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A202C', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  userEmail: { fontSize: 13, color: '#718096', marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: 6, gap: 6 },
  roleBadge: { backgroundColor: '#EDF2F7', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10 },
  roleBadgeAdmin: { backgroundColor: '#EBF4FF' },
  roleText: { fontSize: 12, color: '#4A5568', fontWeight: '600' },
  roleTextAdmin: { color: '#3182CE' },
  inactiveBadge: { backgroundColor: '#FFF5F5', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10 },
  inactiveText: { fontSize: 12, color: '#E53E3E', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 12 },
  actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  actionTextWhite: { color: '#FFFFFF' },
  dangerButton: { backgroundColor: '#E53E3E', borderColor: '#E53E3E' },
  successButton: { backgroundColor: '#38A169', borderColor: '#38A169' },
});