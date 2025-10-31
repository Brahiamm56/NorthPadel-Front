import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

interface CalendarioHorizontalProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reservasPorFecha: { [key: string]: number };
}

export const CalendarioHorizontal: React.FC<CalendarioHorizontalProps> = ({
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

  const esHoy = (fecha: Date) => {
    return format(fecha, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd');
  };

  const esSeleccionado = (fecha: Date) => {
    return format(fecha, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  const tieneReservas = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return reservasPorFecha[fechaStr] > 0;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={80} // Ancho aproximado de cada día
        decelerationRate="fast"
      >
        {fechas.map((fecha, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.diaContainer,
              esSeleccionado(fecha) && styles.diaSeleccionado,
              esHoy(fecha) && !esSeleccionado(fecha) && styles.diaHoy,
            ]}
            onPress={() => onDateSelect(fecha)}
          >
            <Text
              style={[
                styles.diaSemana,
                esSeleccionado(fecha) && styles.textoSeleccionado,
                esHoy(fecha) && !esSeleccionado(fecha) && styles.textoHoy,
              ]}
            >
              {formatearDiaSemana(fecha)}
            </Text>
            <Text
              style={[
                styles.diaNumero,
                esSeleccionado(fecha) && styles.textoSeleccionado,
                esHoy(fecha) && !esSeleccionado(fecha) && styles.textoHoy,
              ]}
            >
              {formatearDia(fecha)}
            </Text>
            {tieneReservas(fecha) && (
              <View style={styles.indicadorReservas} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  diaContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.gray50,
  },
  diaSeleccionado: {
    backgroundColor: colors.primary,
  },
  diaHoy: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  diaSemana: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 2,
  },
  diaNumero: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray700,
  },
  textoSeleccionado: {
    color: colors.white,
  },
  textoHoy: {
    color: colors.primary,
  },
  indicadorReservas: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
});