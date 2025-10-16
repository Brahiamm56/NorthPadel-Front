import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCanchas, getReservasPorFecha, type Cancha, type Reserva, type EstadoPago } from '../../services/reservasService';
import { colors } from '../../theme/colors';

// Componente para mostrar el selector de fechas
const DateSelector = ({ selectedDate, onSelectDate }: { selectedDate: Date; onSelectDate: (date: Date) => void }) => {
  const dates: Date[] = [];
  const today = new Date();
  
  // Generar 7 días a partir de hoy
  for (let i = -3; i <= 3; i++) {
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
                {format(date, 'EEE', { locale: es })}
              </Text>
              <Text style={[
                styles.dateDay,
                isSelected && styles.selectedDateText,
                isTodayDate && !isSelected && styles.todayDateText
              ]}>
                {format(date, 'd')}
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
  canchas: Cancha[]; 
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
const ReservationCard = ({ reserva }: { reserva: Reserva & { nombreCancha: string } }) => {
  const getStatusColor = () => {
    switch (reserva.estadoPago) {
      case 'Pagado':
        return colors.success;
      case 'Pendiente':
        return colors.warning;
      case 'Cancelada':
        return colors.danger;
      default:
        return colors.gray500;
    }
  };

  return (
    <View style={[
      styles.card,
      reserva.estadoPago === 'Cancelada' && styles.canceledCard
    ]}>
      {/* Primera fila */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{reserva.nombreCancha}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{reserva.estadoPago}</Text>
        </View>
      </View>
      
      {/* Segunda fila */}
      <Text style={styles.cardTime}>
        {reserva.horaInicio} a {reserva.horaFin} hs
      </Text>
      
      {/* Tercera fila */}
      <Text style={styles.cardSubtitle}>
        Reservado por: {reserva.usuario}
      </Text>
    </View>
  );
};

// Componente principal de la pantalla de reservas
const AdminReservasScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCancha, setSelectedCancha] = useState<string | null>(null);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Cargar canchas al montar el componente
  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        const canchasData = await getCanchas();
        setCanchas(canchasData);
      } catch (error) {
        console.error('Error al cargar las canchas:', error);
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
        const reservasData = await getReservasPorFecha(selectedDate);
        setReservas(reservasData);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarReservas();
  }, [selectedDate]);

  // Mapear las reservas para incluir el nombre de la cancha y filtrar por cancha seleccionada
  const reservasFiltradas = useMemo(() => {
    return reservas
      .map(reserva => ({
        ...reserva,
        nombreCancha: canchas.find(c => c.id === reserva.canchaId)?.nombre || 'Cancha no encontrada'
      }))
      .filter(reserva => 
        !selectedCancha || reserva.canchaId === selectedCancha
      );
  }, [reservas, canchas, selectedCancha]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSelectCancha = (canchaId: string | null) => {
    setSelectedCancha(canchaId);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </Text>
      </View>

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
          <Text style={styles.emptyText}>No hay reservas para esta fecha</Text>
          <Text style={styles.emptySubtext}>Selecciona otra fecha o intenta más tarde</Text>
        </View>
      ) : (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReservationCard reserva={item} />}
          contentContainerStyle={styles.reservationsList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  dateSelectorContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  dateScrollContent: {
    paddingHorizontal: 12,
  },
  dateButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: colors.gray100,
  },
  selectedDateButton: {
    backgroundColor: colors.primary,
  },
  todayDateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateWeekday: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  selectedDateText: {
    color: colors.white,
  },
  todayDateText: {
    color: colors.primary,
  },
  courtFilterContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  courtFilterContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  courtButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    height: 40,
  },
  selectedCourtButton: {
    backgroundColor: colors.primary,
  },
  courtButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCourtButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  reservationsList: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardTime: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listFooter: {
    height: 24,
  },
});

export default AdminReservasScreen;