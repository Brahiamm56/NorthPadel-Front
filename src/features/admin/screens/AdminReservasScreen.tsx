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
  Image,
  RefreshControl,
  TextInput,
  Animated
} from 'react-native';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { colors } from '../../../styles/colors';
import { spacing, fontSize, borderRadius } from '../../../styles/spacing';
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
} from '../services/admin.service';

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

// Componente para filtrar por estado de reservas
const FilterTabs = ({
  reservas,
  selectedEstado,
  onSelectEstado
}: {
  reservas: ReservaAdmin[];
  selectedEstado: string | null;
  onSelectEstado: (estado: string | null) => void;
}) => {
  const estados = [
    { key: null, label: 'Todas', color: '#666666' },
    { key: 'pendiente', label: 'Pendientes', color: '#FFA726' },
    { key: 'confirmada', label: 'Confirmadas', color: '#4CAF50' },
    { key: 'en_curso', label: 'En curso', color: '#2196F3' },
    { key: 'cancelada', label: 'Canceladas', color: '#EF5350' },
  ];

  const getCount = (estadoKey: string | null) => {
    if (estadoKey === null) return reservas.length;
    return reservas.filter(r => r.estado === estadoKey).length;
  };

  return (
    <View style={styles.filterTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsContent}
      >
        {estados.map((estado) => {
          const isActive = selectedEstado === estado.key;
          const count = getCount(estado.key);
          
          return (
            <TouchableOpacity
              key={estado.key || 'todas'}
              style={[
                styles.filterTab,
                isActive && { backgroundColor: estado.color }
              ]}
              onPress={() => onSelectEstado(estado.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterTabText,
                isActive && styles.filterTabTextActive
              ]}>
                {estado.label}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.filterTabBadge,
                  isActive && styles.filterTabBadgeActive
                ]}>
                  <Text style={[
                    styles.filterTabBadgeText,
                    isActive && styles.filterTabBadgeTextActive
                  ]}>
                    {count}
                  </Text>
                </View>
              )}
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
            Todas las canchas
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

// Componente para mostrar una tarjeta de reserva rediseñada
const ReservationCard = ({
  reserva,
  onPress,
  onConfirmar,
  onCancelar
}: {
  reserva: ReservaAdmin;
  onPress: () => void;
  onConfirmar?: (id: string) => void;
  onCancelar?: (id: string) => void;
}) => {
  const getStatusColor = () => {
    switch (reserva.estado?.toLowerCase()) {
      case 'confirmada':
        return '#4CAF50';
      case 'pendiente':
        return '#FFA726';
      case 'en_curso':
        return '#2196F3';
      case 'completada':
        return '#9E9E9E';
      case 'cancelada':
        return '#EF5350';
      default:
        return '#666666';
    }
  };

  const getStatusLabel = () => {
    return reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1) || 'Pendiente';
  };

  // Generar iniciales del usuario
  const getInitials = (nombre: string) => {
    const names = nombre?.split(' ') || ['U', 'S'];
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : (names[0]?.[0]?.toUpperCase() || 'U');
  };

  return (
    <View style={[styles.card, reserva.estado === 'cancelada' && styles.canceledCard]}>
      {/* HEADER DEL CARD */}
      <View style={styles.newCardHeader}>
        <View style={styles.timeSection}>
          <Text style={styles.newCardTime}>{reserva.hora}</Text>
          <Text style={styles.newCardCancha}>{reserva.canchaNombre}</Text>
        </View>
        <View style={[styles.newStatusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.newStatusText}>{getStatusLabel()}</Text>
        </View>
      </View>

      {/* CUERPO DEL CARD */}
      <View style={styles.cardBody}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getInitials(reserva.usuarioNombre || 'Usuario')}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{reserva.usuarioNombre || 'Usuario'}</Text>
            <Text style={styles.userContact}>{reserva.usuarioEmail}</Text>
          </View>
        </View>

        {/* Thumbnail de la cancha si existe */}
        {reserva.canchaImagenUrl && (
          <Image source={{ uri: reserva.canchaImagenUrl }} style={styles.canchaThumb} />
        )}
      </View>

      {/* FOOTER DEL CARD - Botones de acción */}
      {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
        <View style={styles.cardFooter}>
          {reserva.estado === 'pendiente' && onConfirmar && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => onConfirmar(reserva.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Confirmar</Text>
              </TouchableOpacity>
              {onCancelar && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => onCancelar(reserva.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                  <Text style={styles.actionBtnText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {reserva.estado === 'confirmada' && onCancelar && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => onCancelar(reserva.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.detailsBtn]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={16} color="#001F5B" />
            <Text style={[styles.actionBtnText, { color: '#001F5B' }]}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
      )}
      {(reserva.estado === 'cancelada' || reserva.estado === 'completada') && (
        <TouchableOpacity
          style={[styles.actionBtn, styles.detailsBtnFull]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#001F5B" />
          <Text style={[styles.actionBtnText, { color: '#001F5B' }]}>Ver detalles</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente principal de la pantalla de reservas
const AdminReservasScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCancha, setSelectedCancha] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Función para pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const reservasData = await getAdminReservas();
      setReservas(reservasData);
    } catch (error) {
      console.error('Error al refrescar reservas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar reservas por fecha, cancha, estado y búsqueda
  const reservasFiltradas = useMemo(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return reservas.filter(reserva => {
      // Filtro por fecha
      const matchesDate = reserva.fecha === selectedDateStr;
      
      // Filtro por cancha
      const matchesCancha = !selectedCancha || reserva.canchaNombre === selectedCancha;
      
      // Filtro por estado
      const matchesEstado = !selectedEstado || reserva.estado === selectedEstado;
      
      // Filtro por búsqueda (nombre de usuario o email)
      const matchesSearch = !searchQuery || 
        reserva.usuarioNombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserva.usuarioEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDate && matchesCancha && matchesEstado && matchesSearch;
    });
  }, [reservas, selectedDate, selectedCancha, selectedEstado, searchQuery]);

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

  // Funciones para confirmar/cancelar desde los botones de acción rápida
  const handleConfirmarReservaRapida = async (reservaId: string) => {
    try {
      await confirmarReservaAdmin(reservaId);
      Alert.alert('✅ Éxito', 'Reserva confirmada correctamente');
      // Recargar reservas
      const reservasData = await getAdminReservas();
      setReservas(reservasData);
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      Alert.alert('Error', 'No se pudo confirmar la reserva');
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

  const handleCancelarReservaRapida = async (reservaId: string) => {
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
              await cancelarReservaAdmin(reservaId);
              Alert.alert('✅ Éxito', 'Reserva cancelada correctamente');
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
      {/* Header mejorado con búsqueda y badges */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Reservas</Text>
            {reservasFiltradas.length > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{reservasFiltradas.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setViewMode(viewMode === 'reservas' ? 'disponibilidad' : 'reservas')}
            >
              <Ionicons
                name={viewMode === 'reservas' ? 'grid-outline' : 'calendar-outline'}
                size={22}
                color="#001F5B"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Barra de búsqueda */}
        {viewMode === 'reservas' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por usuario o email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {viewMode === 'reservas' ? (
        <>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          <FilterTabs
            reservas={reservas}
            selectedEstado={selectedEstado}
            onSelectEstado={setSelectedEstado}
          />

          <CourtFilter
            canchas={canchas}
            selectedCancha={selectedCancha}
            onSelectCancha={handleSelectCancha}
          />

          {reservasFiltradas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay reservas</Text>
              <Text style={styles.emptySubtext}>No se encontraron reservas para los filtros seleccionados</Text>
            </View>
          ) : (
            <FlatList
              data={reservasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ReservationCard
                  reserva={item}
                  onPress={() => handleCardPress(item)}
                  onConfirmar={handleConfirmarReservaRapida}
                  onCancelar={handleCancelarReservaRapida}
                />
              )}
              contentContainerStyle={styles.reservationsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#C4D600']}
                  tintColor="#C4D600"
                />
              }
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
          
          {/* Barra de búsqueda para canchas - ARRIBA del título */}
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Buscar canchas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.disponibilidadHeader}>
            <Text style={styles.disponibilidadTitle}>Disponibilidad de Canchas</Text>
            <Text style={styles.disponibilidadSubtitle}>
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </Text>
          </View>
          
          {/* Filtrar canchas por búsqueda */}
          {(() => {
            const canchasFiltradas = canchas.filter(cancha =>
              !searchQuery || cancha.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            return (
              <FlatList
                data={canchasFiltradas}
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
                    <Text style={styles.emptyText}>
                      {searchQuery ? `No se encontraron canchas que coincidan con "${searchQuery}"` : 'No hay canchas disponibles'}
                    </Text>
                  </View>
                )}
              />
            );
          })()}
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
  // Header mejorado
  headerContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#001F5B',
  },
  headerBadge: {
    backgroundColor: '#C4D600',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#001F5B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
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
  // Estilos para FilterTabs
  filterTabsContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTabsContent: {
    paddingHorizontal: spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: spacing.sm,
    minHeight: 36,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#666666',
  },
  filterTabTextActive: {
    color: colors.white,
  },
  filterTabBadge: {
    marginLeft: spacing.xs,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterTabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterTabBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#666666',
  },
  filterTabBadgeTextActive: {
    color: colors.white,
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
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  canceledCard: {
    opacity: 0.65,
  },
  // Estilos del Card Header rediseñado
  newCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeSection: {
    flex: 1,
  },
  newCardTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#001F5B',
    marginBottom: 4,
  },
  newCardCancha: {
    fontSize: fontSize.sm,
    color: '#666666',
    fontWeight: '500',
  },
  newStatusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  newStatusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  // Card Body
  cardBody: {
    marginBottom: spacing.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C4D600',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: '#001F5B',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userContact: {
    fontSize: fontSize.xs,
    color: '#999999',
  },
  canchaThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    flex: 1,
    minWidth: '30%',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
  },
  cancelBtn: {
    backgroundColor: '#EF5350',
  },
  detailsBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsBtnFull: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Estilos legacy (mantener para compatibilidad)
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
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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