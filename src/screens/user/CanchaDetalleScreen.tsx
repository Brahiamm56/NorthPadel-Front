/**
 * CanchaDetalleScreen
 * 
 * Pantalla de detalle de cancha que muestra:
 * - Información de la cancha (nombre, descripción, precio, imágenes)
 * - Selector de fecha (próximos 7 días)
 * - Horarios disponibles (actualizado en tiempo real según reservas existentes)
 * - Botón para confirmar reserva
 * 
 * Conectado a servicios reales:
 * - canchasService.getCanchaDetalle(): Obtiene detalles y disponibilidad
 * - reservasService.crearReserva(): Crea nueva reserva en el backend
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCanchaDetalle } from '../../services/canchasService';
import { crearReserva } from '../../services/reservasService';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

const CanchaDetalleScreen = ({ route, navigation }: any) => {
  const { complejoId, canchaId } = route.params;

  const [canchaDetalle, setCanchaDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el botón de confirmar
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generar los próximos 20 días para el selector de fechas
  const dates = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const date = addDays(new Date(), i);
      return {
        fullDate: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE', { locale: es }),
        dayNumber: format(date, 'd'),
        month: format(date, 'MMM', { locale: es }),
      };
    });
  }, []);

  // Efecto para cargar los detalles de la cancha cada vez que la fecha cambia
  useEffect(() => {
    const loadDetalles = async () => {
      setLoading(true);
      setSelectedTime(null); // Resetea la hora seleccionada al cambiar de día
      try {
        console.log('🔍 Cargando detalles de cancha:', { complejoId, canchaId, selectedDate });
        const data = await getCanchaDetalle(complejoId, canchaId, selectedDate);
        console.log('📦 Datos recibidos del backend:', JSON.stringify(data, null, 2));
        setCanchaDetalle(data);
      } catch (error: any) {
        console.error('❌ Error al cargar detalles:', error);
        Alert.alert('Error', 'No se pudieron cargar los detalles de la cancha.');
      } finally {
        setLoading(false);
      }
    };

    loadDetalles();
  }, [complejoId, canchaId, selectedDate]);
  
  // Función auxiliar para generar horarios desde horaInicio hasta horaFin
  const generarHorariosMaestros = (horaInicio: string, horaFin: string): string[] => {
    const horarios: string[] = [];
    const [inicioHora] = horaInicio.split(':').map(Number);
    const [finHora] = horaFin.split(':').map(Number);
    
    for (let hora = inicioHora; hora <= finHora; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    
    return horarios;
  };

  // Calcular los horarios disponibles filtrando los ocupados
  const horariosDisponibles = useMemo(() => {
    if (!canchaDetalle) {
      console.log('⚠️ No hay canchaDetalle');
      return [];
    }
    
    console.log('🔍 Estructura de canchaDetalle:', {
      tieneHorariosDisponibles: !!canchaDetalle.horariosDisponibles,
      tieneHorariosMaestros: !!canchaDetalle.horariosMaestros,
      tieneHoraInicio: !!canchaDetalle.horaInicio,
      tieneHoraFin: !!canchaDetalle.horaFin,
      horariosReservados: canchaDetalle.horariosReservados,
      horariosBloqueados: canchaDetalle.horariosBloqueados
    });
    
    // FORMATO 1: Backend devuelve horariosDisponibles directamente
    if (canchaDetalle.horariosDisponibles && Array.isArray(canchaDetalle.horariosDisponibles)) {
      console.log('✅ Usando horariosDisponibles del backend:', canchaDetalle.horariosDisponibles);
      return canchaDetalle.horariosDisponibles;
    }
    
    // FORMATO 2: Backend devuelve horariosMaestros y horariosOcupados
    if (canchaDetalle.horariosMaestros && Array.isArray(canchaDetalle.horariosMaestros)) {
      const disponibles = canchaDetalle.horariosMaestros.filter(
        (hora: string) => !canchaDetalle.horariosOcupados?.includes(hora)
      );
      console.log('✅ Calculando disponibles de maestros:', disponibles);
      return disponibles;
    }
    
    // FORMATO 3: Backend devuelve horaInicio, horaFin, horariosReservados y horariosBloqueados
    if (canchaDetalle.horaInicio && canchaDetalle.horaFin) {
      console.log('📅 Generando horarios desde horaInicio hasta horaFin');
      
      // Generar todos los horarios posibles
      const todosLosHorarios = generarHorariosMaestros(
        canchaDetalle.horaInicio, 
        canchaDetalle.horaFin
      );
      console.log('🕐 Horarios generados:', todosLosHorarios);
      
      // Filtrar los reservados y bloqueados
      const reservados = canchaDetalle.horariosReservados || [];
      const bloqueados = canchaDetalle.horariosBloqueados || [];
      const ocupados = [...reservados, ...bloqueados];
      
      const disponibles = todosLosHorarios.filter(
        (hora: string) => !ocupados.includes(hora)
      );
      
      console.log('✅ Horarios disponibles calculados:', {
        total: todosLosHorarios.length,
        reservados: reservados.length,
        bloqueados: bloqueados.length,
        disponibles: disponibles.length,
        lista: disponibles
      });
      
      return disponibles;
    }
    
    console.log('⚠️ No se encontró ningún formato válido de horarios');
    return [];
  }, [canchaDetalle]);

  const handleConfirmarReserva = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Por favor, selecciona una fecha y un horario.");
      return;
    }
    
    setIsSubmitting(true);

    const reservaData = {
      complejoId: complejoId,
      canchaId: canchaId,
      fecha: selectedDate,
      hora: selectedTime,
      usuarioId: 'user-id-placeholder', // TODO: Obtener del contexto de autenticación
    };

    console.log('📤 Creando reserva con estado Pendiente:', reservaData);

    try {
      const resultado = await crearReserva(reservaData);
      if (resultado) {
        Alert.alert(
          "¡Reserva Creada!", 
          "Tu reserva ha sido creada exitosamente. Está pendiente de confirmación por el administrador.", 
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MisReservas')
            }
          ]
        );
      } else {
        throw new Error('La respuesta del servidor no fue exitosa.');
      }
    } catch (error: any) {
      Alert.alert("Error", `No se pudo completar la reserva: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !canchaDetalle) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }
  
  if (!canchaDetalle) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>No se encontraron detalles para esta cancha.</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Galería de Fotos */}
        {(canchaDetalle.imagenes || canchaDetalle.imagenUrl) && (
          <FlatList
            data={canchaDetalle.imagenes || [canchaDetalle.imagenUrl]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
          />
        )}

        <View style={styles.content}>
          {/* Info de la cancha */}
          <Text style={styles.title}>{canchaDetalle.nombre}</Text>
          <Text style={styles.subtitle}>{canchaDetalle.complejoNombre}</Text>
          <Text style={styles.price}>${canchaDetalle.precioHora} / hr</Text>

          {/* Características */}
          {canchaDetalle.caracteristicas && canchaDetalle.caracteristicas.length > 0 && (
            <View style={styles.featuresContainer}>
              {canchaDetalle.caracteristicas.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{canchaDetalle.descripcion}</Text>

          {/* Selector de Fecha */}
          <Text style={styles.sectionTitle}>Seleccioná una fecha</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date.fullDate}
                style={[
                  styles.dateButton,
                  selectedDate === date.fullDate && styles.selectedDateButton
                ]}
                onPress={() => setSelectedDate(date.fullDate)}
              >
                <Text style={[
                  styles.dateDayName,
                  selectedDate === date.fullDate && styles.selectedDateText
                ]}>
                  {date.dayName.toUpperCase()}
                </Text>
                <Text style={[
                  styles.dateDayNumber,
                  selectedDate === date.fullDate && styles.selectedDateText
                ]}>
                  {date.dayNumber}
                </Text>
                <Text style={[
                  styles.dateMonth,
                  selectedDate === date.fullDate && styles.selectedDateText
                ]}>
                  {date.month.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selector de Horarios */}
          <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.timeContainer}>
              {horariosDisponibles.length > 0 ? (
                horariosDisponibles.map((hora: string) => (
                  <TouchableOpacity
                    key={hora}
                    style={[
                      styles.timeButton,
                      selectedTime === hora && styles.selectedTimeButton
                    ]}
                    onPress={() => setSelectedTime(hora)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime === hora && styles.selectedTimeText
                    ]}>
                      {hora}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTimeText}>No hay horarios disponibles para esta fecha.</Text>
              )}
            </View>
          )}

          {/* Botón de Reserva */}
          <TouchableOpacity
            style={[
              styles.reserveButton,
              (!selectedDate || !selectedTime || isSubmitting) && styles.disabledButton
            ]}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            onPress={handleConfirmarReserva}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.reserveButtonText}>Confirmar Reserva</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollView: { flex: 1 },
  galleryImage: { width: width, height: 250, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm },
  price: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.lg },
  featuresContainer: { marginBottom: spacing.lg },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  featureText: { fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 20 },
  datesContainer: { paddingVertical: spacing.sm },
  dateButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 65,
    minHeight: 85,
    justifyContent: 'center',
  },
  selectedDateButton: { backgroundColor: colors.primary },
  dateDayName: { fontSize: fontSize.sm, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  dateDayNumber: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginVertical: 2 },
  dateMonth: { fontSize: fontSize.sm, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '600', marginTop: 4 },
  selectedDateText: { color: colors.white },
  timeContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  timeButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedTimeButton: { backgroundColor: colors.primary },
  timeText: { fontWeight: '600', color: colors.text, fontSize: fontSize.sm },
  selectedTimeText: { color: colors.white },
  noTimeText: { color: colors.textSecondary, fontStyle: 'italic', fontSize: fontSize.sm },
  reserveButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    minHeight: 50,
  },
  disabledButton: { backgroundColor: colors.textSecondary },
  reserveButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: 'bold' },
});

export default CanchaDetalleScreen;