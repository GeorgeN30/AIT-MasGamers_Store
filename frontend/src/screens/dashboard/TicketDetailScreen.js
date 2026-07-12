import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { getCachedImage } from '../../services/imageCacheService';
import { API_BASE_URL } from '../../config';

const API_HOST = API_BASE_URL.replace('/api', '');
const ESTADOS = ['Recibido', 'En diagnostico', 'En reparacion', 'Esperando repuestos', 'Reparado', 'Enviado al cliente', 'Cerrado'];

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params || {};
  const { user, wsEvent } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editEquipo, setEditEquipo] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [pendingEstado, setPendingEstado] = useState(null);
  const [notaTexto, setNotaTexto] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [cachedImage, setCachedImage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketData, logsData, messagesData] = await Promise.all([
          ticketService.getById(ticketId),
          ticketService.getLogs(ticketId),
          ticketService.getMessages(ticketId),
        ]);
        setTicket(ticketData.ticket);
        setLogs(logsData.logs);
        setMessages(messagesData.messages || []);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    if (wsEvent?.type === 'NEW_MESSAGE' && wsEvent?.data?.ticketId === ticketId) {
      setMessages(prev => [...prev, wsEvent.data]);
    }
  }, [wsEvent, ticketId]);

  useEffect(() => {
    if (ticket?.imageUri) {
      getCachedImage(ticket.imageUri).then(setCachedImage);
    }
  }, [ticket?.imageUri]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const result = await ticketService.sendMessage(ticketId, newMessage.trim());
      setMessages(prev => [...prev, result.message]);
      setNewMessage('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const confirmStatusChange = async () => {
    try {
      const result = await ticketService.updateStatus(ticketId, pendingEstado, notaTexto.trim());
      setTicket(result.ticket);
      const logsData = await ticketService.getLogs(ticketId);
      setLogs(logsData.logs);
      setShowNotaModal(false);
      setNotaTexto('');
      setPendingEstado(null);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const changeStatus = (estado) => {
    setPendingEstado(estado);
    setNotaTexto('');
    setShowNotaModal(true);
  };

  const startEdit = () => {
    setEditEquipo(ticket.equipo);
    setEditDescripcion(ticket.descripcion);
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!editEquipo.trim() || !editDescripcion.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    setSavingEdit(true);
    try {
      const result = await ticketService.updateTicket(ticketId, { equipo: editEquipo.trim(), descripcion: editDescripcion.trim() });
      setTicket(result.ticket);
      setEditMode(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await ticketService.deleteTicket(ticketId);
      setShowDeleteModal(false);
      setDeleting(false);
      Alert.alert('Eliminado', 'El ticket fue eliminado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setDeleting(false);
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const playAudio = async () => {
    if (!audioFullUrl) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlaying(false);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFullUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setSound(null);
          setPlaying(false);
        }
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const currentIndex = ESTADOS.indexOf(ticket?.estado);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A202C" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ticket no encontrado</Text>
      </View>
    );
  }

  const imageFullUrl = cachedImage || (ticket.imageUri?.startsWith('/uploads')
    ? `${API_HOST}${ticket.imageUri}`
    : ticket.imageUri);

  const audioFullUrl = ticket.audioUri?.startsWith('/uploads')
    ? `${API_HOST}${ticket.audioUri}`
    : ticket.audioUri;

  const ticketClosed = ticket.estado === 'Cerrado';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {editMode ? (
          <>
            <TextInput style={styles.editInput} value={editEquipo} onChangeText={setEditEquipo} placeholder="Equipo" />
            <TextInput style={[styles.editInput, styles.editTextArea]} value={editDescripcion} onChangeText={setEditDescripcion} placeholder="Descripcion" multiline numberOfLines={4} />
            <Text style={styles.categoria}>{ticket.categoria}</Text>
            <Text style={styles.date}>Creado: {ticket.created_at?.substring(0, 10)}</Text>
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveEditButton} onPress={saveEdit} disabled={savingEdit}>
                <Text style={styles.saveEditText}>{savingEdit ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelEditButton} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelEditText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.equipo}>{ticket.equipo}</Text>
            <Text style={styles.categoria}>{ticket.categoria}</Text>
            <Text style={styles.descripcion}>{ticket.descripcion}</Text>
            <Text style={styles.date}>Creado: {ticket.created_at?.substring(0, 10)}</Text>
          </>
        )}
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Estado Actual</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{ticket.estado}</Text>
        </View>
      </View>

      {ticket.latitude && ticket.longitude && (
        <TouchableOpacity
          style={styles.mediaCard}
          onPress={() => Linking.openURL(`https://maps.google.com/maps?q=${ticket.latitude},${ticket.longitude}`)}
        >
          <Text style={styles.mediaText}>Ubicacion: {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}</Text>
        </TouchableOpacity>
      )}

      {imageFullUrl && (
        <View style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Evidencia</Text>
          <Image source={{ uri: imageFullUrl }} style={styles.imagePreview} resizeMode="contain" />
        </View>
      )}

      {audioFullUrl && (
        <View style={styles.mediaCard}>
          <Text style={styles.sectionTitle}>Nota de Voz</Text>
          <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
            <Text style={styles.audioButtonText}>
              {playing ? 'Detener' : 'Reproducir'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Cambiar Estado</Text>
          <View style={styles.statusGrid}>
            {ESTADOS.map((estado, index) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.statusBtn,
                  ticket.estado === estado && styles.statusBtnActive,
                  index < currentIndex && styles.statusBtnPast,
                ]}
                onPress={() => changeStatus(estado)}
              >
                <Text style={[
                  styles.statusBtnText,
                  ticket.estado === estado && styles.statusBtnTextActive,
                  index < currentIndex && styles.statusBtnTextPast,
                ]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity style={styles.editTicketButton} onPress={startEdit}>
              <Text style={styles.editTicketText}>Editar ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteTicketButton} onPress={handleDelete}>
              <Text style={styles.deleteTicketText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showNotaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar a: {pendingEstado}</Text>
            <Text style={styles.modalLabel}>Nota (opcional):</Text>
            <TextInput
              style={styles.modalInput}
              value={notaTexto}
              onChangeText={setNotaTexto}
              placeholder="Motivo del cambio..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmStatusChange}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowNotaModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar ticket</Text>
            <Text style={styles.modalBody}>Esta accion no se puede deshacer. Seguro?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete} disabled={deleting}>
                <Text style={styles.deleteConfirmText}>{deleting ? 'Eliminando...' : 'Eliminar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Historial</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <View style={styles.logDot} />
          <View style={styles.logContent}>
            <Text style={styles.logText}>
              {log.estado_anterior ? `${log.estado_anterior} -> ${log.estado_nuevo}` : log.estado_nuevo}
            </Text>
            {log.nota ? <Text style={styles.logNota}>{log.nota}</Text> : null}
            <Text style={styles.logMeta}>
              {log.changedByName} - {log.created_at?.substring(0, 10)}
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Chat del ticket</Text>
      <View style={styles.chatContainer}>
        <ScrollView ref={scrollRef} style={styles.chatMessages} nestedScrollEnabled>
          {messages.length === 0 && (
            <Text style={styles.chatEmpty}>Sin mensajes aun. Escribe el primero.</Text>
          )}
          {messages.map((msg) => {
            const isMine = msg.userId === user?.id;
            return (
              <View key={msg.id} style={[styles.chatBubble, isMine ? styles.chatBubbleMine : styles.chatBubbleOther]}>
                <View style={styles.chatBubbleHeader}>
                  <Text style={[styles.chatBubbleName, isMine && styles.chatBubbleNameMine]}>
                    {msg.userName}
                  </Text>
                  {msg.userRole === 'admin' && (
                    <Text style={styles.chatBadge}>Soporte</Text>
                  )}
                </View>
                <Text style={[styles.chatBubbleText, isMine && styles.chatBubbleTextMine]}>
                  {msg.message}
                </Text>
                <Text style={[styles.chatBubbleTime, isMine && styles.chatBubbleTimeMine]}>
                  {msg.created_at?.substring(11, 16)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        {ticketClosed ? (
          <View style={styles.chatClosedBanner}>
            <Text style={styles.chatClosedText}>Este ticket esta cerrado. No se pueden enviar mensajes.</Text>
          </View>
        ) : (
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#A0A0A0"
              multiline
              editable={!sendingMessage}
            />
            <TouchableOpacity
              style={[styles.chatSendBtn, (!newMessage.trim() || sendingMessage) && styles.chatSendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
            >
              <Text style={styles.chatSendText}>{sendingMessage ? '...' : 'Enviar'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  errorText: { color: '#E53E3E', fontSize: 16 },
  card: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  equipo: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginBottom: 4 },
  categoria: { fontSize: 13, color: '#718096', marginBottom: 12 },
  descripcion: { fontSize: 15, color: '#4A5568', marginBottom: 12, lineHeight: 22 },
  date: { fontSize: 12, color: '#A0AEC0' },
  statusCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  statusBadge: { backgroundColor: '#EBF4FF', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12 },
  statusText: { color: '#3182CE', fontSize: 14, fontWeight: 'bold' },
  mediaCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  mediaText: { fontSize: 14, color: '#4A5568' },
  imagePreview: { width: '100%', height: 250, borderRadius: 8, marginTop: 8 },
  audioButton: { backgroundColor: '#1A202C', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  audioButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  adminSection: { marginBottom: 20 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E0' },
  statusBtnActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  statusBtnPast: { backgroundColor: '#C6F6D5', borderColor: '#38A169' },
  statusBtnText: { fontSize: 12, color: '#4A5568' },
  statusBtnTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  statusBtnTextPast: { color: '#2D3748', fontWeight: 'bold' },
  adminActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  editTicketButton: { flex: 1, backgroundColor: '#1A202C', padding: 12, borderRadius: 8, alignItems: 'center' },
  editTicketText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  deleteTicketButton: { flex: 1, backgroundColor: '#E53E3E', padding: 12, borderRadius: 8, alignItems: 'center' },
  deleteTicketText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  deleteConfirmBtn: { flex: 1, backgroundColor: '#E53E3E', padding: 12, borderRadius: 8, alignItems: 'center' },
  deleteConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  editInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, padding: 10, fontSize: 15, color: '#1A202C', marginBottom: 10 },
  editTextArea: { height: 100, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveEditButton: { flex: 1, backgroundColor: '#38A169', padding: 10, borderRadius: 6, alignItems: 'center' },
  saveEditText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cancelEditButton: { flex: 1, backgroundColor: '#A0AEC0', padding: 10, borderRadius: 6, alignItems: 'center' },
  cancelEditText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  logItem: { flexDirection: 'row', marginBottom: 12 },
  logDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3182CE', marginTop: 5, marginRight: 12 },
  logContent: { flex: 1 },
  logText: { fontSize: 14, color: '#2D3748' },
  logNota: { fontSize: 13, color: '#718096', fontStyle: 'italic', marginTop: 2 },
  logMeta: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
  modalBody: { fontSize: 15, color: '#4A5568', marginBottom: 20, lineHeight: 22 },
  modalLabel: { fontSize: 14, color: '#4A5568', marginBottom: 8 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, padding: 12, fontSize: 15, color: '#1A202C', marginBottom: 16, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalConfirmBtn: { flex: 1, backgroundColor: '#1A202C', padding: 12, borderRadius: 8, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalCancelBtn: { flex: 1, backgroundColor: '#A0AEC0', padding: 12, borderRadius: 8, alignItems: 'center' },
  modalCancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  chatContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', marginBottom: 24, overflow: 'hidden',
  },
  chatMessages: { maxHeight: 300, padding: 12 },
  chatEmpty: { color: '#A0AEC0', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  chatBubble: { marginBottom: 10, maxWidth: '80%', padding: 10, borderRadius: 10 },
  chatBubbleMine: { backgroundColor: '#1A202C', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  chatBubbleOther: { backgroundColor: '#EDF2F7', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  chatBubbleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chatBubbleName: { fontSize: 12, fontWeight: '600', color: '#718096' },
  chatBubbleNameMine: { color: '#A0AEC0' },
  chatBadge: {
    fontSize: 10, backgroundColor: '#3182CE', color: '#FFF',
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6, fontWeight: 'bold',
  },
  chatBubbleText: { fontSize: 14, color: '#2D3748' },
  chatBubbleTextMine: { color: '#FFFFFF' },
  chatBubbleTime: { fontSize: 10, color: '#A0AEC0', marginTop: 2, textAlign: 'right' },
  chatBubbleTimeMine: { color: '#718096' },
  chatInputRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', padding: 8 },
  chatInput: {
    flex: 1, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#1A202C',
    maxHeight: 80, backgroundColor: '#F7FAFC',
  },
  chatSendBtn: {
    backgroundColor: '#1A202C', borderRadius: 8, paddingHorizontal: 16,
    justifyContent: 'center', marginLeft: 8,
  },
  chatSendBtnDisabled: { opacity: 0.5 },
  chatSendText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  chatClosedBanner: {
    borderTopWidth: 1, borderColor: '#E2E8F0', padding: 14, alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  chatClosedText: { color: '#E53E3E', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
