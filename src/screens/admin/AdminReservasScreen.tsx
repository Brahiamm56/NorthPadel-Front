import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
  Image
} from 'react-native';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import {
  getAdminReservas,
  confirmarReservaAdmin,
  cancelarReservaAdmin,
  getCanchaDisponibilidad,
  bloquearHorarioAdmin,
  desbloquearHorarioAdmin,
  ReservaAdmin,
  CanchaAdmin,
  getMisCanchasAdmin
} from '../../services/adminService';

// Componente para mostrar el selector de fechas
const DateSelector = ({ selectedDate, onSelectDate }: { selectedDate: Date; onSelectDate: (date: Date) => void }) => {
  const dates: Date[] = [];
  const today = new Date();

  // Generar 20 días a partir de hoy
  for (let i = 0; i < 20; i++) {
    const date = addDays(today, i);
    dates.push(date);
  }

  return (
    <View style={styles.dateSelectorContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContent}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                isSelected && styles.selectedDateButton,
                isTodayDate && !isSelected && styles.todayDateButton
              ]}
              onPress={() => onSelectDate(date)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dateWeekday,
                isSelected && styles.selectedDateText,
                isTodayDate && !isSelected && styles.todayDateText
              ]}>
                {format(date, 'EEE', { locale: es }).toUpperCase()}
              </Text>
              <Text style={[
                styles.dateDay,
                isSelected && styles.selectedDateText,
                isTodayDate && !isSelected && styles.todayDateText
              ]}>
                {format(date, 'd')}
              </Text>
              <Text style={[
                styles.dateMonth,
                isSelected && styles.selectedDateText,
                isTodayDate && !isSelected && styles.todayDateText
              ]}>
                {format(date, 'MMM', { locale: es }).toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Componente para el filtro de canchas
const CourtFilter = ({
  canchas,
  selectedCancha,
  onSelectCancha
}: {
  canchas: CanchaAdmin[];
  selectedCancha: string | null;
  onSelectCancha: (id: string | null) => void
}) => {
  return (
    <View style={styles.courtFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courtFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.courtButton,
            selectedCancha === null && styles.selectedCourtButton
          ]}
          onPress={() => onSelectCancha(null)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.courtButtonText,
            selectedCancha === null && styles.selectedCourtButtonText
          ]}>
            Todas
          </Text>
        </TouchableOpacity>

        {canchas.map((cancha) => (
          <TouchableOpacity
            key={cancha.id}
            style={[
              styles.courtButton,
              selectedCancha === cancha.id && styles.selectedCourtButton
            ]}
            onPress={() => onSelectCancha(cancha.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.courtButtonText,
                selectedCancha === cancha.id && styles.selectedCourtButtonText
              ]}
              numberOfLines={1}
            >
              {cancha.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Componente para mostrar una tarjeta de reserva
const ReservationCard = ({ reserva, onPress }: { reserva: ReservaAdmin; onPress: () => void }) => {
  const getStatusColor = () => {
    switch (reserva.estado) {
      case 'confirmada':
        return colors.success;
      case 'pendiente':
        return colors.warning;
      case 'cancelada':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        reserva.estado === 'cancelada' && styles.canceledCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Primera fila */}
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          {reserva.canchaImagenUrl && (
            <Image source={{ uri: reserva.canchaImagenUrl }} style={styles.cardImage} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{reserva.canchaNombre}</Text>
            <Text style={styles.cardTime}>
              {reserva.hora} hs
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{reserva.estado}</Text>
        </View>
      </View>

      {/* Segunda fila */}
      <Text style={styles.cardSubtitle}>
        {reserva.usuarioNombre} - {reserva.usuarioEmail}
      </Text>
    </TouchableOpacity>
  );
};

// Componente principal de la pantalla de reservas
const AdminReservasScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCancha, setSelectedCancha] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'reservas' | 'disponibilidad'>('reservas');
  const [canchas, setCanchas] = useState<CanchaAdmin[]>([]);
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaAdmin | null>(null);

  // Estados para el Bottom Sheet de disponibilidad
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [selectedCourtForAvailability, setSelectedCourtForAvailability] = useState<{id: string, nombre: string} | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Cargar canchas al montar el componente
  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        console.log('🔍 Cargando canchas del administrador...');
        const canchasData = await getMisCanchasAdmin();
        console.log('✅ Canchas recibidas:', canchasData);
        console.log('📊 Cantidad de canchas:', canchasData.length);
        setCanchas(canchasData);
      } catch (error) {
        console.error('❌ Error al cargar las canchas:', error);
      }
    };

    cargarCanchas();
  }, []);

  // Cargar reservas cuando cambia la fecha seleccionada
  useEffect(() => {
    const cargarReservas = async () => {
      if (!selectedDate) return;

      setLoading(true);
      try {
        const reservasData = await getAdminReservas();
        setReservas(reservasData);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarReservas();
  }, [selectedDate]);

  // Filtrar reservas por fecha y cancha seleccionada
  const reservasFiltradas = useMemo(() => {
    // Convertir selectedDate a formato YYYY-MM-DD para comparación
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return reservas.filter(reserva => {
      // Comparar directamente los strings de fecha (YYYY-MM-DD)
      // Esto evita problemas de zona horaria
      const matchesDate = reserva.fecha === selectedDateStr;
      const matchesCancha = !selectedCancha || reserva.canchaNombre === selectedCancha;
      return matchesDate && matchesCancha;
    });
  }, [reservas, selectedDate, selectedCancha]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSelectCancha = (canchaId: string | null) => {
    setSelectedCancha(canchaId);
  };

  const handleCardPress = (reserva: ReservaAdmin) => {
    setSelectedReserva(reserva);
    setModalVisible(true);
  };

  // Función para manejar el click en una cancha (vista disponibilidad)
  const handleCourtPress = async (cancha: CanchaAdmin) => {
    setLoadingSlots(true);
    setAvailabilityModalVisible(true);
    setSelectedCourtForAvailability({ id: cancha.id, nombre: cancha.nombre });
    setBookedSlots([]);
    setBlockedSlots([]);

    try {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      const disponibilidad = await getCanchaDisponibilidad(cancha.id, selectedDateStr);
      console.log('🕒 Disponibilidad recibida:', disponibilidad);
      setBookedSlots(disponibilidad.horariosReservados);
      setBlockedSlots(disponibilidad.horariosBloqueados);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo obtener la disponibilidad');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Función para manejar el click en un slot horario (bloquear/desbloquear)
  const handleSlotPress = async (hora: string) => {
    if (!selectedCourtForAvailability) return;

    // No permitir acciones sobre horarios reservados
    if (bookedSlots.includes(hora)) {
      Alert.alert('Información', 'Este horario está reservado por un usuario y no puede ser bloqueado.');
      return;
    }

    const isBlocked = blockedSlots.includes(hora);
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    
    try {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log(`${isBlocked ? '🔓' : '🔒'} ${action} horario ${hora}`);
      
      if (isBlocked) {
        // Desbloquear
        await desbloquearHorarioAdmin(selectedCourtForAvailability.id, selectedDateStr, hora);
        Alert.alert('✅ Éxito', `Horario ${hora} desbloqueado correctamente`);
      } else {
        // Bloquear
        await bloquearHorarioAdmin(selectedCourtForAvailability.id, selectedDateStr, hora);
        Alert.alert('✅ Éxito', `Horario ${hora} bloqueado correctamente`);
      }

      // Refrescar la disponibilidad
      const disponibilidad = await getCanchaDisponibilidad(selectedCourtForAvailability.id, selectedDateStr);
      setBookedSlots(disponibilidad.horariosReservados);
      setBlockedSlots(disponibilidad.horariosBloqueados);
      
    } catch (error: any) {
      console.error(`Error al ${action} horario:`, error);
      Alert.alert('Error', error.message || `No se pudo ${action} el horario`);
    }
  };

  const handleConfirmarReserva = async () => {
    if (!selectedReserva) return;

    try {
      await confirmarReservaAdmin(selectedReserva.id);
      Alert.alert('Éxito', 'Reserva confirmada correctamente');
      setModalVisible(false);
      // Recargar reservas
      const reservasData = await getAdminReservas();
      setReservas(reservasData);
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      Alert.alert('Error', 'No se pudo confirmar la reserva');
    }
  };

  const handleCancelarReserva = async () => {
    if (!selectedReserva) return;

    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarReservaAdmin(selectedReserva.id);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              setModalVisible(false);
              // Recargar reservas
              const reservasData = await getAdminReservas();
              setReservas(reservasData);
            } catch (error) {
              console.error('Error cancelando reserva:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  if (loading && reservas.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setViewMode(viewMode === 'reservas' ? 'disponibilidad' : 'reservas')}
        >
          <Ionicons
            name={viewMode === 'reservas' ? 'options-outline' : 'calendar-outline'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {viewMode === 'reservas' ? (
        <>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          <CourtFilter
            canchas={canchas}
            selectedCancha={selectedCancha}
            onSelectCancha={handleSelectCancha}
          />

          {reservasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay reservas para esta fecha</Text>
              <Text style={styles.emptySubtext}>Selecciona otra fecha o intenta más tarde</Text>
            </View>
          ) : (
            <FlatList
              data={reservasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ReservationCard
                  reserva={item}
                  onPress={() => handleCardPress(item)}
                />
              )}
              contentContainerStyle={styles.reservationsList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={styles.listFooter} />}
            />
          )}
        </>
      ) : (
        <>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          <View style={styles.disponibilidadHeader}>
            <Text style={styles.disponibilidadTitle}>Disponibilidad de Canchas</Text>
            <Text style={styles.disponibilidadSubtitle}>
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </Text>
          </View>
          <FlatList
            data={canchas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.canchaCard}
                onPress={() => handleCourtPress(item)}
                activeOpacity={0.7}
              >
                {item.imagenUrl && (
                  <Image source={{ uri: item.imagenUrl }} style={styles.canchaCardImage} />
                )}
                <View style={styles.canchaCardInfo}>
                  <Text style={styles.canchaCardTitle}>{item.nombre}</Text>
                  <Text style={styles.canchaCardPrice}>${item.precioHora}/hr</Text>
                  <Text style={styles.canchaCardAction}>Toca para ver disponibilidad →</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.canchasList}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="tennisball-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No hay canchas disponibles</Text>
              </View>
            )}
          />
        </>
      )}

      {/* Modal de detalles de reserva */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Barra de manejo */}
            <View style={styles.handleBar} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de Reserva</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedReserva && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBody}
              >
                {selectedReserva.canchaImagenUrl && (
                  <Image
                    source={{ uri: selectedReserva.canchaImagenUrl }}
                    style={styles.modalImage}
                  />
                )}
                <Text style={styles.modalCanchaTitle}>{selectedReserva.canchaNombre}</Text>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalDetailText}>
                    👤 {selectedReserva.usuarioNombre}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    📧 {selectedReserva.usuarioEmail}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    🕐 {selectedReserva.hora} hs
                  </Text>
                  <Text style={styles.modalDetailText}>
                    📅 {format(new Date(selectedReserva.fecha), "EEEE d 'de' MMMM", { locale: es })}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    📊 Estado: {selectedReserva.estado}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmarReserva}
                  >
                    <Text style={styles.modalButtonText}>Confirmar Reserva</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelarReserva}
                  >
                    <Text style={styles.modalButtonText}>Cancelar Reserva</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal Bottom Sheet de Disponibilidad */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={availabilityModalVisible}
        onRequestClose={() => setAvailabilityModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvailabilityModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handleBar} />
            
            {selectedCourtForAvailability && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedCourtForAvailability.nombre}
                  </Text>
                  <TouchableOpacity onPress={() => setAvailabilityModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.availabilitySubtitle}>
                  Disponibilidad para {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </Text>

                {loadingSlots ? (
                  <ActivityIndicator 
                    size="large" 
                    color={colors.primary} 
                    style={styles.loadingIndicator}
                  />
                ) : (
                  <ScrollView style={styles.slotsContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.slotsGrid}>
                      {['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'].map((hora) => {
                        const isBooked = bookedSlots.includes(hora);
                        const isBlocked = blockedSlots.includes(hora);
                        const isAvailable = !isBooked && !isBlocked;
                        
                        return (
                          <TouchableOpacity
                            key={hora}
                            style={[
                              styles.slotChip,
                              isBooked && styles.slotBooked,
                              isBlocked && styles.slotBlocked,
                              isAvailable && styles.slotAvailable
                            ]}
                            onPress={() => handleSlotPress(hora)}
                            disabled={isBooked}
                            activeOpacity={isBooked ? 1 : 0.7}
                          >
                            <Text 
                              style={[
                                styles.slotText,
                                isBooked && styles.slotTextBooked,
                                isBlocked && styles.slotTextBlocked,
                                isAvailable && styles.slotTextAvailable
                              ]}
                            >
                              {hora}
                            </Text>
                            <Text 
                              style={[
                                styles.slotStatus,
                                isBooked && styles.slotStatusBooked,
                                isBlocked && styles.slotStatusBlocked,
                                isAvailable && styles.slotStatusAvailable
                              ]}
                            >
                              {isBooked && '🔴 Reservado'}
                              {isBlocked && '🔒 Bloqueado'}
                              {isAvailable && '✅ Libre'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    padding: spacing.sm,
  },
  dateSelectorContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateScrollContent: {
    paddingHorizontal: spacing.md,
  },
  dateButton: {
    width: 65,
    minHeight: 85,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: 4,
    backgroundColor: colors.background,
  },
  selectedDateButton: {
    backgroundColor: colors.primary,
  },
  todayDateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateWeekday: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateDay: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  selectedDateText: {
    color: colors.white,
  },
  todayDateText: {
    color: colors.primary,
  },
  courtFilterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  courtFilterContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  courtButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    height: 40,
  },
  selectedCourtButton: {
    backgroundColor: colors.primary,
  },
  courtButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  selectedCourtButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  reservationsList: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  canceledCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listFooter: {
    height: 24,
  },
  disponibilidadContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  disponibilidadTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  disponibilidadSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textTransform: 'capitalize',
  },
  disponibilidadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    paddingBottom: spacing.lg,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  modalCanchaTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalDetails: {
    marginBottom: spacing.xl,
  },
  modalDetailText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  confirmButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Estilos para la vista de disponibilidad de canchas
  disponibilidadHeader: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  canchaCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canchaCardImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  canchaCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  canchaCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  canchaCardPrice: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  canchaCardAction: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  canchasList: {
    paddingVertical: spacing.md,
  },
  // Estilos para el Bottom Sheet de disponibilidad
  availabilitySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textTransform: 'capitalize',
  },
  loadingIndicator: {
    marginVertical: spacing.xl,
  },
  slotsContainer: {
    maxHeight: 400,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  slotChip: {
    width: '31%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  slotAvailable: {
    backgroundColor: '#d4edda',
    borderColor: colors.primary,
  },
  slotBooked: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  slotBlocked: {
    backgroundColor: '#cfe2ff',
    borderColor: '#0d6efd',
  },
  slotText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  slotTextAvailable: {
    color: colors.primary,
  },
  slotTextBooked: {
    color: '#dc3545',
  },
  slotTextBlocked: {
    color: '#0d6efd',
  },
  slotStatus: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  slotStatusAvailable: {
    color: colors.primary,
  },
  slotStatusBooked: {
    color: '#dc3545',
  },
  slotStatusBlocked: {
    color: '#0d6efd',
  },
});

export default AdminReservasScreen;