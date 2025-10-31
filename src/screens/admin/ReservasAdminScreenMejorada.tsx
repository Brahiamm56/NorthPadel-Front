import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  SafeAreaView, 
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

// Importar servicios existentes
import { getAdminReservas, confirmarReservaAdmin, cancelarReservaAdmin } from '../../services/adminService';
import { colors } from '../../theme/colors';

// Importar componentes mejorados
import { HeaderMejorado } from '../admin/HeaderMejorado';
import { CalendarioHorizontalMejorado } from '../admin/CalendarioHorizontalMejorado';
import { FiltrosMejorados } from '../admin/FiltrosMejorados';
import { ReservaCardMejorada } from '../admin/ReservaCardMejorada';
import { SkeletonReservaCard } from '../admin/SkeletonLoading';
import { EmptyState } from '../admin/EmptyState';
import { FloatingActionButton } from '../admin/FloatingActionButton';

// Tipo de dato para las reservas (manteniendo la estructura existente)
type ReservaAdmin = {
  id: string;
  fecha: string; // Formato YYYY-MM-DD
  hora: string;
  canchaId: string;
  canchaNombre?: string;
  canchaImagenUrl?: string;
  usuarioId: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  estado: string;
  fechaCreacion: any;
};

const ReservasAdminScreenMejorada = () => {
  // Estados principales (manteniendo la lógica existente)
  const [todasLasReservas, setTodasLasReservas] = useState<ReservaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para filtros
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourt, setSelectedCourt] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendientes' | 'confirmadas' | 'canceladas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCanchas, setBusquedaCanchas] = useState('');

  // Estados para modal de detalles
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaAdmin | null>(null);

  // Estados para filtros avanzados
  const [filtrosAvanzadosVisible, setFiltrosAvanzadosVisible] = useState(false);

  // Generar fechas para el calendario (manteniendo lógica existente)
  const fechas = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i)), []);

  // Extraer canchas únicas (manteniendo lógica existente)
  const canchasUnicas = useMemo(() => {
    const canchasMap = new Map();
    todasLasReservas.forEach(r => {
      if (r.canchaId) {
        canchasMap.set(r.canchaId, r.canchaNombre || r.canchaId);
      }
    });
    const canchasArray = Array.from(canchasMap, ([id, nombre]) => ({ id, nombre }))
                           .sort((a,b) => a.nombre.localeCompare(b.nombre));
    return [{ id: 'Todas', nombre: 'Todas' }, ...canchasArray];
  }, [todasLasReservas]);

  // Contar reservas por fecha
  const reservasPorFecha = useMemo(() => {
    const conteo: { [key: string]: number } = {};
    todasLasReservas.forEach(r => {
      conteo[r.fecha] = (conteo[r.fecha] || 0) + 1;
    });
    return conteo;
  }, [todasLasReservas]);

  // Contar reservas por estado para el día seleccionado
  const conteosPorEstado = useMemo(() => {
    const reservasDelDia = todasLasReservas.filter(r => r.fecha === selectedDate);
    return {
      todas: reservasDelDia.length,
      pendientes: reservasDelDia.filter(r => r.estado?.toLowerCase() === 'pendiente').length,
      confirmadas: reservasDelDia.filter(r => r.estado?.toLowerCase() === 'confirmada').length,
      canceladas: reservasDelDia.filter(r => r.estado?.toLowerCase() === 'cancelada').length,
    };
  }, [todasLasReservas, selectedDate]);

  // Función para cargar reservas (manteniendo lógica existente)
  const cargarReservas = async () => {
    setLoading(true);
    try {
      const data = await getAdminReservas();
      setTodasLasReservas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getAdminReservas();
      setTodasLasReservas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
    } finally {
      setRefreshing(false);
    }
  };

  // Usar useFocusEffect para recargar las reservas (manteniendo lógica existente)
  useFocusEffect(useCallback(() => {
    cargarReservas();
  }, []));

  // Filtrar reservas (mejorando la lógica existente)
  const reservasFiltradas = useMemo(() => {
    let resultado = todasLasReservas.filter(reserva => reserva.fecha === selectedDate);

    // Filtrar por cancha
    if (selectedCourt !== 'Todas') {
      resultado = resultado.filter(r => r.canchaId === selectedCourt);
    }

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      const estadoBuscado = filtroEstado === 'pendientes' ? 'pendiente' : 
                           filtroEstado === 'confirmadas' ? 'confirmada' : 'cancelada';
      resultado = resultado.filter(r => r.estado?.toLowerCase() === estadoBuscado);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(r => 
        r.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.usuarioEmail?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return resultado;
  }, [selectedDate, selectedCourt, filtroEstado, busqueda, todasLasReservas]);

  // Funciones para manejar acciones de reservas
  const handleConfirmarReserva = async (reservaId: string) => {
    try {
      const success = await confirmarReservaAdmin(reservaId);
      if (success) {
        // Actualizar UI optimísticamente
        setTodasLasReservas(prev => 
          prev.map(r => r.id === reservaId ? { ...r, estado: 'Confirmada' } : r)
        );
        Alert.alert('Éxito', 'Reserva confirmada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo confirmar la reserva');
    }
  };

  const handleCancelarReserva = async (reservaId: string) => {
    try {
      const success = await cancelarReservaAdmin(reservaId);
      if (success) {
        // Actualizar UI optimísticamente
        setTodasLasReservas(prev => 
          prev.map(r => r.id === reservaId ? { ...r, estado: 'Cancelada' } : r)
        );
        Alert.alert('Éxito', 'Reserva cancelada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la reserva');
    }
  };

  const handleContactarUsuario = (reservaId: string) => {
    const reserva = todasLasReservas.find(r => r.id === reservaId);
    if (reserva?.usuarioEmail) {
      Alert.alert(
        'Contactar Usuario',
        `Email: ${reserva.usuarioEmail}`,
        [
          { text: 'Cerrar', style: 'cancel' }
        ]
      );
    }
  };

  // Función para abrir detalles de reserva
  const handleCardPress = (reserva: ReservaAdmin) => {
    setSelectedReserva(reserva);
    setModalVisible(true);
  };

  // Función para crear nueva reserva
  const handleCrearReserva = () => {
    // Aquí puedes navegar a la pantalla de crear reserva
    Alert.alert('Crear Reserva', 'Funcionalidad de crear reserva pendiente de implementar');
  };

  // Renderizar cada card de reserva
  const renderReservaCard = ({ item }: { item: ReservaAdmin }) => (
    <ReservaCardMejorada
      reserva={item}
      onPress={() => handleCardPress(item)}
      onConfirmar={handleConfirmarReserva}
      onCancelar={handleCancelarReserva}
      onContactar={handleContactarUsuario}
    />
  );

  // Renderizar skeleton loading
  const renderSkeletonCards = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonReservaCard key={index} />
      ))}
    </View>
  );

  // Mostrar loading inicial
  if (loading && !todasLasReservas.length) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderMejorado
          totalReservasDia={0}
          busqueda=""
          onBusquedaChange={() => {}}
          onFiltrosAvanzados={() => {}}
        />
        {renderSkeletonCards()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header mejorado */}
      <HeaderMejorado
        totalReservasDia={conteosPorEstado.todas}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onFiltrosAvanzados={() => setFiltrosAvanzadosVisible(true)}
      />

      {/* Calendario horizontal mejorado */}
      <CalendarioHorizontalMejorado
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        reservasPorFecha={reservasPorFecha}
      />

      {/* Filtros mejorados */}
      <FiltrosMejorados
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        canchaSeleccionada={selectedCourt}
        onCanchaChange={setSelectedCourt}
        canchasDisponibles={canchasUnicas}
        conteosPorEstado={conteosPorEstado}
        busquedaCanchas={busquedaCanchas}
        onBusquedaCanchasChange={setBusquedaCanchas}
      />

      {/* Lista de reservas */}
      <FlatList
        data={reservasFiltradas}
        renderItem={renderReservaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brandGreen]}
            tintColor={colors.brandGreen}
          />
        }
        ListEmptyComponent={
          <EmptyState
            onVerOtroDia={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            onCrearReserva={handleCrearReserva}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleCrearReserva} />

      {/* Modal de detalles (manteniendo funcionalidad existente) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.handleBar} />
            {selectedReserva && (
              <>
                {selectedReserva.canchaImagenUrl && (
                  <Image
                    source={{ uri: selectedReserva.canchaImagenUrl }}
                    style={styles.modalImage}
                    onError={() => console.log('Error cargando imagen modal')}
                  />
                )}
                <Text style={styles.modalTitle}>Detalle de la Reserva</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={20} color={colors.brandBlue} />
                  <Text style={styles.detailText}>{selectedReserva.usuarioNombre}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="tennisball-outline" size={20} color={colors.brandBlue} />
                  <Text style={styles.detailText}>{selectedReserva.canchaNombre || selectedReserva.canchaId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color={colors.brandBlue} />
                  <Text style={styles.detailText}>Hora: {selectedReserva.hora}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color={colors.brandBlue} />
                  <Text style={styles.detailText}>
                    {format(parseISO(selectedReserva.fecha), 'EEEE d \'de\' MMMM', { locale: es })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={20} color={colors.brandBlue} />
                  <Text style={styles.detailText}>Estado: {selectedReserva.estado || 'Pendiente'}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    if (selectedReserva.estado?.toLowerCase() === 'pendiente') {
                      handleConfirmarReserva(selectedReserva.id);
                    }
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedReserva.estado?.toLowerCase() === 'pendiente' ? 'Confirmar Reserva' : 'Marcar como Pagado'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    handleCancelarReserva(selectedReserva.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancelar Reserva</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  skeletonContainer: {
    padding: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: colors.gray300,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.brandBlue,
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.gray100,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.brandBlue,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: colors.brandGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: 12,
  },
  cancelButtonText: {
    color: colors.error,
  },
});

export default ReservasAdminScreenMejorada;
