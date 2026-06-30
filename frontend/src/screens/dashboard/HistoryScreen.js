import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../../services/ticketService';

const ESTADOS = ['', 'Recibido', 'En diagnostico', 'En reparacion', 'Esperando repuestos', 'Reparado', 'Enviado al cliente', 'Cerrado'];
const CATEGORIAS = ['', 'Soporte Tecnico', 'Ventas'];

export default function HistoryScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [showEstados, setShowEstados] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketService.getAll({ estado: estadoFiltro, categoria: categoriaFiltro, q: busqueda.trim() });
      setTickets(data.tickets);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [estadoFiltro, categoriaFiltro, busqueda]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const aplicarFiltros = () => {
    setShowEstados(false);
    setShowCategorias(false);
    fetchTickets();
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('');
    setCategoriaFiltro('');
  };

  const getMediaIcons = (ticket) => {
    const icons = [];
    if (ticket.imageUri) icons.push('📷');
    if (ticket.audioUri) icons.push('🎤');
    if (ticket.latitude && ticket.longitude) icons.push('📍');
    return icons;
  };

  const hasActiveFilters = busqueda || estadoFiltro || categoriaFiltro;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por equipo o descripcion..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
          onSubmitEditing={aplicarFiltros}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <TouchableOpacity style={styles.filterButton} onPress={() => { setShowEstados(!showEstados); setShowCategorias(false); }}>
            <Text style={styles.filterButtonText}>{estadoFiltro || 'Estado'}</Text>
          </TouchableOpacity>
          {showEstados && (
            <View style={styles.dropdown}>
              {ESTADOS.map((e) => (
                <TouchableOpacity key={e} style={[styles.dropdownItem, estadoFiltro === e && styles.dropdownItemActive]} onPress={() => { setEstadoFiltro(e); setShowEstados(false); }}>
                  <Text style={[styles.dropdownText, estadoFiltro === e && styles.dropdownTextActive]}>{e || 'Todos'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filterItem}>
          <TouchableOpacity style={styles.filterButton} onPress={() => { setShowCategorias(!showCategorias); setShowEstados(false); }}>
            <Text style={styles.filterButtonText}>{categoriaFiltro || 'Categoria'}</Text>
          </TouchableOpacity>
          {showCategorias && (
            <View style={styles.dropdown}>
              {CATEGORIAS.map((c) => (
                <TouchableOpacity key={c} style={[styles.dropdownItem, categoriaFiltro === c && styles.dropdownItemActive]} onPress={() => { setCategoriaFiltro(c); setShowCategorias(false); }}>
                  <Text style={[styles.dropdownText, categoriaFiltro === c && styles.dropdownTextActive]}>{c || 'Todas'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={aplicarFiltros}>
          <Text style={styles.applyButtonText}>Filtrar</Text>
        </TouchableOpacity>

        {hasActiveFilters ? (
          <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : tickets.length > 0 ? (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.component}>{item.equipo}</Text>
                <Text style={styles.date}>{item.created_at?.substring(0, 10)}</Text>
              </View>
              <Text style={styles.description}>{item.descripcion}</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.estado}</Text>
                </View>
              </View>
              {getMediaIcons(item).length > 0 && (
                <View style={styles.mediaRow}>
                  {getMediaIcons(item).map((icon, i) => (
                    <Text key={i} style={styles.mediaIcon}>{icon}</Text>
                  ))}
                  <Text style={styles.mediaLabel}>Archivos adjuntos</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin tickets</Text>
          <Text style={styles.emptyDesc}>No se encontraron tickets con esos filtros.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#1A202C' },
  searchRow: { marginBottom: 12 },
  searchInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 15, color: '#1A202C' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' },
  filterItem: { position: 'relative', zIndex: 10 },
  filterButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  filterButtonText: { color: '#4A5568', fontSize: 14, fontWeight: '500' },
  dropdown: { position: 'absolute', top: 42, left: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, minWidth: 180, zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  dropdownItemActive: { backgroundColor: '#EBF4FF' },
  dropdownText: { color: '#2D3748', fontSize: 14 },
  dropdownTextActive: { color: '#3182CE', fontWeight: 'bold' },
  applyButton: { backgroundColor: '#1A202C', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  applyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  clearButton: { backgroundColor: '#E53E3E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginLeft: 4 },
  clearButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  errorBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FC8181', borderRadius: 6, padding: 10, marginBottom: 16 },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  component: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', flex: 1 },
  date: { fontSize: 13, color: '#A0AEC0' },
  description: { fontSize: 15, color: '#4A5568', marginBottom: 15 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 12,
  },
  statusLabel: { fontSize: 14, color: '#718096' },
  badge: { backgroundColor: '#EBF4FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { color: '#3182CE', fontSize: 13, fontWeight: 'bold' },
  mediaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  mediaIcon: { fontSize: 16 },
  mediaLabel: { fontSize: 12, color: '#A0AEC0', marginLeft: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#718096', textAlign: 'center' },
});