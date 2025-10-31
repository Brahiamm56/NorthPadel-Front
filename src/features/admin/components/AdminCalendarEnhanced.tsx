import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface CalendarioHorizontalMejoradoProps {
  selectedDate: string; // Formato YYYY-MM-DD
  onDateSelect: (date: string) => void;
  reservasPorFecha: { [key: string]: number };
}

export const CalendarioHorizontalMejorado: React.FC<CalendarioHorizontalMejoradoProps> = ({
  selectedDate,
  onDateSelect,
  reservasPorFecha,
}) => {
  // Generar fechas: 7 días atrás hasta 7 días adelante
  const fechas = [];
  const hoy = new Date();

  for (let i = -7; i <= 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    fechas.push(fecha);
  }

  const formatearDiaSemana = (fecha: Date) => {
    return format(fecha, 'EEE', { locale: es }).toUpperCase();
  };

  const formatearDia = (fecha: Date) => {
    return format(fecha, 'd');
  };

  const formatearMes = (fecha: Date) => {
    return format(fecha, 'MMM', { locale: es }).toUpperCase();
  };

  const esHoy = (fecha: Date) => {
    return format(fecha, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd');
  };

  const esSeleccionado = (fecha: Date) => {
    return format(fecha, 'yyyy-MM-dd') === selectedDate;
  };

  const getCantidadReservas = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return reservasPorFecha[fechaStr] || 0;
  };

  const irAHoy = () => {
    const hoyStr = format(hoy, 'yyyy-MM-dd');
    onDateSelect(hoyStr);
  };

  return (
    <View style={styles.container}>
      {/* Botón "Hoy" flotante */}
      <TouchableOpacity style={styles.botonHoy} onPress={irAHoy}>
        <Ionicons name="today" size={16} color={colors.brandBlue} />
        <Text style={styles.botonHoyTexto}>Hoy</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={85} // Ancho aproximado de cada día
        decelerationRate="fast"
      >
        {fechas.map((fecha, index) => {
          const cantidadReservas = getCantidadReservas(fecha);
          const esHoyFecha = esHoy(fecha);
          const esSeleccionadoFecha = esSeleccionado(fecha);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.diaContainer,
                esSeleccionadoFecha && styles.diaSeleccionado,
                esHoyFecha && !esSeleccionadoFecha && styles.diaHoy,
              ]}
              onPress={() => onDateSelect(format(fecha, 'yyyy-MM-dd'))}
              activeOpacity={0.7}
            >
              {/* Badge con cantidad de reservas */}
              {cantidadReservas > 0 && (
                <View style={styles.badgeReservas}>
                  <Text style={styles.badgeTexto}>{cantidadReservas}</Text>
                </View>
              )}

              {/* Contenido del día */}
              <Text
                style={[
                  styles.diaSemana,
                  esSeleccionadoFecha && styles.textoSeleccionado,
                  esHoyFecha && !esSeleccionadoFecha && styles.textoHoy,
                ]}
              >
                {formatearDiaSemana(fecha)}
              </Text>
              <Text
                style={[
                  styles.diaNumero,
                  esSeleccionadoFecha && styles.textoSeleccionado,
                  esHoyFecha && !esSeleccionadoFecha && styles.textoHoy,
                ]}
              >
                {formatearDia(fecha)}
              </Text>
              <Text
                style={[
                  styles.diaMes,
                  esSeleccionadoFecha && styles.textoSeleccionado,
                  esHoyFecha && !esSeleccionadoFecha && styles.textoHoy,
                ]}
              >
                {formatearMes(fecha)}
              </Text>

              {/* Indicador especial para hoy */}
              {esHoyFecha && (
                <View style={styles.indicadorHoy} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  diaContainer: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    position: 'relative',
  },
  diaSeleccionado: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreen,
    shadowColor: colors.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  diaHoy: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brandBlue,
  },
  diaSemana: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 2,
  },
  diaNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 2,
  },
  diaMes: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray600,
  },
  textoSeleccionado: {
    color: colors.white,
  },
  textoHoy: {
    color: colors.brandBlue,
  },
  badgeReservas: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF5350',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeTexto: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  indicadorHoy: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandBlue,
  },
  botonHoy: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botonHoyTexto: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
