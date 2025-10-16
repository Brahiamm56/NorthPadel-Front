import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCanchaDetalle, type CanchaDetalle } from '../../services/canchasService';
import { crearReserva } from '../../services/reservasService';
import { colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type CanchasStackParamList = {
  CanchasHome: undefined;
  CanchaDetalle: { canchaId: string; complejoId: string };
};

type Props = NativeStackScreenProps<CanchasStackParamList, 'CanchaDetalle'>;

/**
 * Pantalla de Detalle de Cancha - Vista del Cliente
 * Muestra información detallada de una cancha y permite hacer reservas
 */
const CanchaDetalleScreen = ({ route, navigation }: Props) => {
  const { canchaId, complejoId } = route.params;
  
  const [cancha, setCancha] = useState<CanchaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generar próximos 7 días
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      dates.push({
        id: date.toISOString(),
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: monthNames[date.getMonth()],
        fullDate: date,
      });
    }
    
    return dates;
  };

  const [dates] = useState(generateDates());

  useEffect(() => {
    loadCanchaDetalle();
  }, [canchaId, complejoId]);

  const loadCanchaDetalle = async () => {
    try {
      console.log('🔵 Cargando detalle de cancha:', canchaId, 'complejo:', complejoId);
      const data = await getCanchaDetalle(complejoId, canchaId);
      console.log('🔵 Detalle cargado:', data);
      setCancha(data);
    } catch (error) {
      console.error('🔴 Error al cargar detalle de cancha:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle de la cancha');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Atención', 'Por favor selecciona una fecha y horario');
      return;
    }

    console.log('Confirmando reserva...');

    // Formatear la fecha al formato YYYY-MM-DD
    const dateObj = dates.find(d => d.id === selectedDate);
    const fechaFormateada = dateObj ? 
      `${dateObj.fullDate.getFullYear()}-${String(dateObj.fullDate.getMonth() + 1).padStart(2, '0')}-${String(dateObj.fullDate.getDate()).padStart(2, '0')}` 
      : '';

    // Preparamos los datos para enviar al backend
    const reservaData = {
      complejoId: complejoId,
      canchaId: canchaId,
      fecha: fechaFormateada,
      hora: selectedTime,
      usuarioId: 'USER_ID_DE_EJEMPLO' // TODO: Obtener el ID real del usuario autenticado
    };

    const resultado = await crearReserva(reservaData);

    if (resultado) {
      Alert.alert('¡Éxito!', 'Tu reserva ha sido confirmada.', [
        {
          text: 'OK',
          onPress: () => {
            // Navegar a la pantalla de "Mis Reservas"
            navigation.navigate('MisReservas' as never);
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'No se pudo completar la reserva. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!cancha) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
      </View>
    );
  }

  const isReservationValid = selectedDate && selectedTime;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Galería de imágenes */}
        <FlatList
          data={cancha.imagenes}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          )}
        />

        {/* Información básica */}
        <View style={styles.infoContainer}>
          <Text style={styles.canchaName}>{cancha.nombre}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={colors.gray500} />
            <Text style={styles.complejoName}>{cancha.complejoNombre}</Text>
          </View>
          <Text style={styles.precio}>{cancha.precioHora} / hora</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descripcion}>{cancha.descripcion}</Text>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.caracteristicasContainer}>
            {cancha.caracteristicas.map((caracteristica, index) => (
              <View key={index} style={styles.caracteristicaItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.caracteristicaText}>{caracteristica}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selector de fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date.id}
                style={[
                  styles.dateButton,
                  selectedDate === date.id && styles.dateButtonSelected,
                ]}
                onPress={() => setSelectedDate(date.id)}
              >
                <Text
                  style={[
                    styles.dayName,
                    selectedDate === date.id && styles.dateTextSelected,
                  ]}
                >
                  {date.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === date.id && styles.dateTextSelected,
                  ]}
                >
                  {date.dayNumber}
                </Text>
                <Text
                  style={[
                    styles.monthName,
                    selectedDate === date.id && styles.dateTextSelected,
                  ]}
                >
                  {date.monthName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selector de horarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona un horario</Text>
          <View style={styles.horariosContainer}>
            {cancha.horariosDisponibles.map((horario) => (
              <TouchableOpacity
                key={horario}
                style={[
                  styles.horarioButton,
                  selectedTime === horario && styles.horarioButtonSelected,
                ]}
                onPress={() => setSelectedTime(horario)}
              >
                <Text
                  style={[
                    styles.horarioText,
                    selectedTime === horario && styles.horarioTextSelected,
                  ]}
                >
                  {horario}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Espaciado para el botón fijo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón de confirmar reserva (fijo en la parte inferior) */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !isReservationValid && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmReservation}
          disabled={!isReservationValid}
        >
          <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: 400,
    height: 250,
    backgroundColor: colors.gray200,
  },
  infoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  canchaName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complejoName: {
    fontSize: 16,
    color: colors.gray600,
    marginLeft: 4,
  },
  precio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  caracteristicasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  caracteristicaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  caracteristicaText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
  },
  datesContainer: {
    paddingRight: 20,
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  dateButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  monthName: {
    fontSize: 12,
    color: colors.gray600,
  },
  dateTextSelected: {
    color: colors.white,
  },
  horariosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horarioButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  horarioButtonSelected: {
    backgroundColor: colors.primary,
  },
  horarioText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  horarioTextSelected: {
    color: colors.white,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CanchaDetalleScreen;
