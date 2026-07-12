import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, PanResponder, Animated, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';

const PANEL_WIDTH = Math.min(Dimensions.get('window').width - 20, 340);

export default function NotificationPanel({ visible, onClose, onNavigate }) {
  const { user, wsEvent, refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await ticketService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fetchNotifications]);

  useEffect(() => {
    if (wsEvent?.type === 'STATUS_CHANGE' || wsEvent?.type === 'NEW_MESSAGE' || wsEvent?.type === 'TICKET_CREATED') {
      fetchNotifications();
    }
  }, [wsEvent, fetchNotifications]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(1 - gestureState.dx / PANEL_WIDTH);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const markRead = async (id) => {
    try {
      await ticketService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      refreshUnreadCount();
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      await ticketService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
    } catch {}
  };

  const deleteAll = async () => {
    try {
      await ticketService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      refreshUnreadCount();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await ticketService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
      setUnreadCount(0);
      refreshUnreadCount();
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

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PANEL_WIDTH, 0],
  });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View
          style={[styles.panel, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Notificaciones</Text>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead}>
                  <Text style={styles.markAllText}>Leer todo</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity onPress={deleteAll}>
                  <Text style={styles.deleteAllText}>Borrar todo</Text>
                </TouchableOpacity>
              )}
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
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteNotification(item.id)}
                >
                  <Text style={styles.deleteBtnText}>X</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  panel: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: PANEL_WIDTH,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#E2E8F0',
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  headerActions: { flexDirection: 'row', gap: 14 },
  markAllText: { color: '#3182CE', fontSize: 12, fontWeight: '600' },
  deleteAllText: { color: '#E53E3E', fontSize: 12, fontWeight: '600' },
  list: { padding: 10 },
  empty: { textAlign: 'center', color: '#A0AEC0', fontSize: 14, marginTop: 30 },
  item: {
    flexDirection: 'row', padding: 10, borderRadius: 10,
    marginBottom: 8, alignItems: 'center',
  },
  itemUnread: { backgroundColor: '#EBF8FF' },
  itemRead: { backgroundColor: '#FFFFFF' },
  itemContent: { flex: 1 },
  itemType: { fontSize: 10, color: '#3182CE', fontWeight: '600', marginBottom: 2 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 2 },
  itemTitleUnread: { color: '#1A202C' },
  itemBody: { fontSize: 12, color: '#718096', marginBottom: 4 },
  itemTime: { fontSize: 10, color: '#A0AEC0' },
  deleteBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FED7D7', justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
  deleteBtnText: { color: '#E53E3E', fontSize: 11, fontWeight: 'bold' },
});
