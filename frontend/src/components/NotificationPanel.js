import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';

export default function NotificationPanel({ visible, onClose, onNavigate }) {
  const { user, wsEvent } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await ticketService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (visible) fetchNotifications();
  }, [visible, fetchNotifications]);

  useEffect(() => {
    if (wsEvent?.type === 'STATUS_CHANGE' || wsEvent?.type === 'NEW_MESSAGE' || wsEvent?.type === 'TICKET_CREATED') {
      fetchNotifications();
    }
  }, [wsEvent, fetchNotifications]);

  const markRead = async (id) => {
    try {
      await ticketService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await ticketService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  const handlePress = (notif) => {
    if (notif.ticketId) {
      onNavigate('TicketDetail', { ticketId: notif.ticketId });
    }
    markRead(notif.id);
    onClose();
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'status_change': return 'Cambio de estado';
      case 'new_message': return 'Nuevo mensaje';
      case 'ticket_created': return 'Nuevo ticket';
      default: return 'Notificacion';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markAllText}>Marcar todas leidas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin notificaciones</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.read ? styles.itemRead : styles.itemUnread]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemType}>{typeIcon(item.type)}</Text>
                <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.itemTime}>{item.created_at?.substring(0, 16)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#1A202C',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerActions: { flexDirection: 'row', gap: 12 },
  markAllText: { color: '#63B3ED', fontSize: 13 },
  closeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: '#A0AEC0', fontSize: 15, marginTop: 40 },
  item: { flexDirection: 'row', padding: 14, borderRadius: 10, marginBottom: 8, alignItems: 'center' },
  itemUnread: { backgroundColor: '#EBF8FF' },
  itemRead: { backgroundColor: '#FFFFFF' },
  itemContent: { flex: 1 },
  itemType: { fontSize: 11, color: '#3182CE', fontWeight: '600', marginBottom: 2 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 2 },
  itemTitleUnread: { color: '#1A202C' },
  itemBody: { fontSize: 13, color: '#718096', marginBottom: 4 },
  itemTime: { fontSize: 11, color: '#A0AEC0' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3182CE', marginLeft: 8 },
});