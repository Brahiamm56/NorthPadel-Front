import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { ReservaAdmin } from '../../types/reservas.types';

interface ReservaCardProps {
  reserva: ReservaAdmin;
  onCancelar: (reservaId: string) => void;
}

export const ReservaCard: React.FC<ReservaCardProps> = ({
  reserva,
  onCancelar,
}) => {
  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = parseISO(fechaStr);
      return format(fecha, "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return fechaStr;
    }
  };

  const formatearHora = (hora: string) => {
    return `${hora} - ${parseInt(hora.split(':')[0]) + 1}:00`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada':
        return {
          bg: '#dcfce7',
          text: '#16a34a',
          border: colors.success,
          icon: 'checkmark-circle' as const,
        };
      case 'Cancelada':
        return {
          bg: '#fee2e2',
          text: '#dc2626',
          border: colors.error,
          icon: 'close-circle' as const,
        };
      default:
        return {
          bg: colors.gray100,
          text: colors.gray600,
          border: colors.gray300,
          icon: 'help-circle' as const,
        };
    }
  };

  const estadoStyle = getEstadoColor(reserva.estado);

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => onCancelar(reserva.id)
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { borderLeftColor: estadoStyle.border }]}>
      <View style={styles.header}>
        <View style={styles.canchaInfo}>
          <Ionicons name="tennisball" size={20} color={colors.primary} />
          <Text style={styles.canchaNombre}>{reserva.canchaNombre}</Text>
        </View>
        {reserva.canchaImagen ? (
          <Image source={{ uri: reserva.canchaImagen }} style={styles.imagen} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="tennisball" size={24} color={colors.gray400} />
          </View>
        )}
      </View>

      <View style={styles.horaFecha}>
        <View style={styles.horaContainer}>
          <Ionicons name="time" size={16} color={colors.gray500} />
          <Text style={styles.hora}>{formatearHora(reserva.hora)}</Text>
        </View>
        <View style={styles.fechaContainer}>
          <Ionicons name="calendar" size={16} color={colors.gray500} />
          <Text style={styles.fecha}>{formatearFecha(reserva.fecha)}</Text>
        </View>
      </View>

      <View style={styles.usuarioInfo}>
        <View style={styles.usuarioRow}>
          <Ionicons name="person" size={16} color={colors.gray500} />
          <Text style={styles.usuarioNombre}>{reserva.usuarioNombre}</Text>
        </View>
        <View style={styles.usuarioRow}>
          <Ionicons name="call" size={16} color={colors.gray500} />
          <Text style={styles.usuarioTelefono}>{reserva.usuarioTelefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.usuarioRow}>
          <Ionicons name="mail" size={16} color={colors.gray500} />
          <Text style={styles.usuarioEmail}>{reserva.usuarioEmail}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg }]}>
          <Ionicons name={estadoStyle.icon} size={16} color={estadoStyle.text} />
          <Text style={[styles.estadoTexto, { color: estadoStyle.text }]}>
            {reserva.estado.toUpperCase()}
          </Text>
        </View>

        <View style={styles.botones}>
          <TouchableOpacity style={styles.botonDetalle}>
            <Text style={styles.botonDetalleTexto}>Ver detalles</Text>
          </TouchableOpacity>

          {reserva.estado === 'Confirmada' && (
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={handleCancelar}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    margin: spacing.md,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  canchaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  canchaNombre: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagenPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horaFecha: {
    marginBottom: spacing.sm,
  },
  horaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  hora: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fecha: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  usuarioInfo: {
    marginBottom: spacing.md,
  },
  usuarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  usuarioNombre: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  usuarioTelefono: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  usuarioEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  estadoTexto: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  botones: {
    flexDirection: 'row',
  },
  botonDetalle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: spacing.sm,
  },
  botonDetalleTexto: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  botonCancelar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },
  botonCancelarTexto: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '500',
  },
});