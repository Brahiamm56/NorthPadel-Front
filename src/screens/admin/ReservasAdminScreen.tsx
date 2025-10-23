import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Alert, SafeAreaView, Modal, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAdminReservas } from '../../services/adminService'; // Asegúrate que la ruta es correcta
import { colors } from '../../theme/colors'; // Asegúrate que la ruta es correcta
import { format, addDays, parseISO } from 'date-fns'; // Importar parseISO
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener @expo/vector-icons instalado

// Tipo de dato para las reservas que esperamos del backend
type ReservaAdmin = {
    id: string;
    fecha: string; // Formato YYYY-MM-DD
    hora: string;
    canchaId: string;
    canchaNombre?: string; // Nombre legible de la cancha
    canchaImagenUrl?: string; // URL de la imagen de la cancha
    usuarioId: string;
    usuarioNombre?: string; // Nombre legible del usuario
    estado: string;
    fechaCreacion: any; // O el tipo correcto que envíe Firestore
};


const AdminReservasScreen = () => {
  const [todasLasReservas, setTodasLasReservas] = useState<ReservaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Bottom Sheet
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaAdmin | null>(null);

  // Estados para los filtros
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourt, setSelectedCourt] = useState('Todas'); // El ID de la cancha o 'Todas'

  // Generamos las fechas para el filtro
  const fechas = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i)), []);

  // Extraemos las canchas únicas para el filtro
  const canchasUnicas = useMemo(() => {
    const canchasMap = new Map();
    todasLasReservas.forEach(r => {
        // Usamos canchaNombre si existe, si no, el ID como fallback
        if (r.canchaId) {
            canchasMap.set(r.canchaId, r.canchaNombre || r.canchaId);
        }
    });
    const canchasArray = Array.from(canchasMap, ([id, nombre]) => ({ id, nombre }))
                           .sort((a,b) => a.nombre.localeCompare(b.nombre));
    return [{ id: 'Todas', nombre: 'Todas' }, ...canchasArray];
  }, [todasLasReservas]);

  // Función para cargar las reservas desde el backend
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

  // Usamos useFocusEffect para recargar las reservas cada vez que la pantalla obtiene foco
  useFocusEffect(useCallback(() => {
    cargarReservas();
  }, []));

  // Filtramos las reservas basándonos en la fecha y cancha seleccionadas
  const reservasFiltradas = useMemo(() => {
    return todasLasReservas.filter(reserva =>
      reserva.fecha === selectedDate &&
      (selectedCourt === 'Todas' || reserva.canchaId === selectedCourt)
    );
  }, [selectedDate, selectedCourt, todasLasReservas]);

  // Función para abrir el modal con los detalles de la reserva seleccionada
  const handleCardPress = (reserva: ReservaAdmin) => {
    setSelectedReserva(reserva);
    setModalVisible(true);
  };

  // Componente para renderizar cada tarjeta de reserva en la lista
  const renderReservaCard = ({ item }: { item: ReservaAdmin }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.card}>
        <View style={styles.cardContent}>
            <Text style={styles.cardTime}>{item.hora}</Text>
            {/* Mostramos el nombre de la cancha si existe, si no el ID */}
            <Text style={styles.cardCourt}>{item.canchaNombre || item.canchaId}</Text>
            <Text style={styles.cardUser}>Reservado por: {item.usuarioNombre || 'Usuario Desconocido'}</Text>
        </View>
        {/* Mostramos la imagen de la cancha si la URL existe */}
        {item.canchaImagenUrl && (
            <Image
                source={{ uri: item.canchaImagenUrl }}
                style={styles.cardImage}
                onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
            />
        )}
    </TouchableOpacity>
  );

  // Componente a mostrar cuando no hay reservas para los filtros seleccionados
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={colors.gray300 || '#dee2e6'} />
        <Text style={styles.emptyTitle}>Sin Reservas</Text>
        <Text style={styles.emptySubtitle}>No se encontraron reservas para los filtros seleccionados.</Text>
    </View>
  );

  // Muestra el indicador de carga mientras se obtienen los datos iniciales
  if (loading && !todasLasReservas.length) {
    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}><Text style={styles.headerTitle}>Reservas del Complejo</Text></View>
            <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} color={colors.primary || '#28a745'}/>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Reservas del Complejo</Text></View>

      {/* Contenedor de los filtros */}
      <View style={styles.filtersContainer}>
        {/* Filtro de Fechas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
            {fechas.map(date => {
                const dateString = format(date, 'yyyy-MM-dd');
                const isActive = dateString === selectedDate;
                return (
                    <TouchableOpacity
                        key={date.toISOString()}
                        style={[styles.dateFilterButton, isActive && styles.activeFilter]}
                        onPress={() => setSelectedDate(dateString)}
                    >
                        {/* Mostramos día de la semana y número */}
                        <Text style={[styles.dateDayName, isActive && styles.activeFilterText]}>{format(date, 'EEE', { locale: es })}</Text>
                        <Text style={[styles.dateDayNumber, isActive && styles.activeFilterText]}>{format(date, 'd')}</Text>
                        <Text style={[styles.dateMonth, isActive && styles.activeFilterText]}>{format(date, 'MMM', { locale: es })}</Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
        {/* Filtro de Canchas (usando nombres) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
            {canchasUnicas.map(cancha => {
                const isActive = cancha.id === selectedCourt;
                return (
                    <TouchableOpacity
                        key={cancha.id}
                        style={[styles.courtFilterButton, isActive && styles.activeFilter]}
                        onPress={() => setSelectedCourt(cancha.id)} // Guardamos el ID al seleccionar
                    >
                        {/* Mostramos el nombre en el botón */}
                        <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{cancha.nombre}</Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
      </View>

      {/* Lista de reservas filtradas */}
      <FlatList
        data={reservasFiltradas}
        renderItem={renderReservaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState} // Componente a mostrar si no hay reservas
      />

      {/* Modal Bottom Sheet para detalles */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Fondo oscuro semi-transparente */}
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
            {/* Contenedor del contenido del modal */}
            <View style={styles.modalContent}>
                {/* Barra pequeña para indicar que se puede deslizar */}
                <View style={styles.handleBar} />
                {/* Mostramos los detalles solo si hay una reserva seleccionada */}
                {selectedReserva && (
                    <>
                        {/* Imagen de la cancha */}
                        {selectedReserva.canchaImagenUrl && (
                            <Image
                                source={{ uri: selectedReserva.canchaImagenUrl }}
                                style={styles.modalImage}
                                onError={(e) => console.log('Error cargando imagen modal:', e.nativeEvent.error)}
                            />
                        )}
                        <Text style={styles.modalTitle}>Detalle de la Reserva</Text>
                        {/* Filas con íconos y detalles */}
                        <View style={styles.detailRow}><Ionicons name="person-outline" size={20} color={colors.primary || '#28a745'} /><Text style={styles.detailText}>{selectedReserva.usuarioNombre}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="tennisball-outline" size={20} color={colors.primary || '#28a745'} /><Text style={styles.detailText}>{selectedReserva.canchaNombre || selectedReserva.canchaId}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="time-outline" size={20} color={colors.primary || '#28a745'} /><Text style={styles.detailText}>Hora: {selectedReserva.hora}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="calendar-outline" size={20} color={colors.primary || '#28a745'} /><Text style={styles.detailText}>{format(parseISO(selectedReserva.fecha), 'EEEE d \'de\' MMMM', { locale: es })}</Text></View>
                        <View style={styles.detailRow}><Ionicons name="cash-outline" size={20} color={colors.primary || '#28a745'} /><Text style={styles.detailText}>Estado: {selectedReserva.estado || 'Pendiente'}</Text></View>

                        {/* Botones de acción */}
                        <TouchableOpacity style={styles.actionButton}><Text style={styles.actionButtonText}>Marcar como Pagado</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}><Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancelar Reserva</Text></TouchableOpacity>
                    </>
                )}
            </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

// --- ESTILOS --- (Asegúrate de tenerlos definidos o usa estos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f0f2f5' },
    header: { backgroundColor: colors.white || '#fff', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray200 || '#e9ecef', paddingTop: 10, paddingBottom: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' }, // Tamaño ajustado
    filtersContainer: { backgroundColor: colors.white || '#fff', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.gray200 || '#e9ecef', paddingTop: 8 },
    filterScrollView: { paddingHorizontal: 16, paddingTop: 12, flexGrow: 0 },
    dateFilterButton: { // Estilo inspirado en la imagen de ejemplo
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: colors.gray100 || '#f8f9fa',
        marginRight: 10,
        alignItems: 'center',
        minWidth: 65,
        borderWidth: 1,
        borderColor: colors.gray200 || '#e9ecef',
    },
    courtFilterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.gray100 || '#f8f9fa', marginRight: 10, borderWidth: 1, borderColor: colors.gray200 || '#e9ecef', height: 40, justifyContent: 'center' },
    activeFilter: { backgroundColor: colors.primary || '#28a745', borderColor: colors.primary || '#28a745' },
    dateDayName: { fontSize: 12, textTransform: 'uppercase', color: colors.textSecondary || '#6c757d', fontWeight: '600', marginBottom: 2 },
    dateDayNumber: { fontSize: 18, fontWeight: 'bold', color: colors.text || '#212529' },
    dateMonth: { fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary || '#6c757d', fontWeight: '500' }, // Añadido mes
    filterText: { color: colors.textSecondary || '#6c757d', fontWeight: '600', fontSize: 14 },
    activeFilterText: { color: colors.white || '#fff' },
    listContent: { padding: 16, flexGrow: 1 }, // Añadido flexGrow para centrar EmptyState
    card: {
        backgroundColor: colors.white || '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.gray200 || '#e9ecef',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: { flex: 1, marginRight: 10 },
    cardTime: { fontSize: 18, fontWeight: 'bold', color: colors.primary || '#28a745', marginBottom: 4 },
    cardCourt: { fontSize: 16, color: colors.text || '#212529', marginVertical: 4, fontWeight: '500' },
    cardUser: { fontSize: 14, color: colors.textSecondary || '#6c757d' },
    cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.gray100 || '#f8f9fa' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text || '#212529', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary || '#6c757d', textAlign: 'center', marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 12 },
    handleBar: { width: 40, height: 5, backgroundColor: colors.gray300 || '#dee2e6', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 16, backgroundColor: colors.gray100 || '#f8f9fa' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    detailText: { fontSize: 16, marginLeft: 12, color: colors.text || '#212529' },
    actionButton: { backgroundColor: colors.primary || '#28a745', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger || '#dc3545', marginTop: 12 },
    cancelButtonText: { color: colors.danger || '#dc3545' },
});

export default AdminReservasScreen;
