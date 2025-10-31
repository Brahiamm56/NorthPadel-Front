import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Tipos para las props del componente
interface ReservaCardMejoradaProps {
  reserva: {
    id: string;
    fecha: string;
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
  onPress: () => void;
  onConfirmar?: (reservaId: string) => void;
  onCancelar?: (reservaId: string) => void;
  onContactar?: (reservaId: string) => void;
}

export const ReservaCardMejorada: React.FC<ReservaCardMejoradaProps> = ({
  reserva,
  onPress,
  onConfirmar,
  onCancelar,
  onContactar,
}) => {
  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return '#4CAF50';
      case 'pendiente':
        return '#FFA726';
      case 'en curso':
        return '#2196F3';
      case 'completada':
        return '#9E9E9E';
      case 'cancelada':
        return '#EF5350';
      default:
        return '#FFA726';
    }
  };

  // Función para calcular la hora de fin (asumiendo 1.5 horas de duración)
  const getHoraFin = (horaInicio: string) => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const horaFin = hora + 1;
    const minutoFin = minuto + 30;
    
    if (minutoFin >= 60) {
      return `${horaFin + 1}:${(minutoFin - 60).toString().padStart(2, '0')}`;
    }
    return `${horaFin}:${minutoFin.toString().padStart(2, '0')}`;
  };

  // Función para obtener las iniciales del usuario
  const getInicialesUsuario = (nombre?: string) => {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Función para manejar acciones según el estado
  const handleAccion = (accion: string) => {
    switch (accion) {
      case 'confirmar':
        if (onConfirmar) {
          Alert.alert(
            'Confirmar Reserva',
            '¿Estás seguro de confirmar esta reserva?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Confirmar', onPress: () => onConfirmar(reserva.id) }
            ]
          );
        }
        break;
      case 'cancelar':
        if (onCancelar) {
          Alert.alert(
            'Cancelar Reserva',
            '¿Estás seguro de cancelar esta reserva?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Sí, cancelar', style: 'destructive', onPress: () => onCancelar(reserva.id) }
            ]
          );
        }
        break;
      case 'contactar':
        if (onContactar) {
          onContactar(reserva.id);
        }
        break;
    }
  };

  const estadoColor = getEstadoColor(reserva.estado);
  const horaFin = getHoraFin(reserva.hora);
  const iniciales = getInicialesUsuario(reserva.usuarioNombre);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.98}
    >
      {/* HEADER DEL CARD */}
      <View style={styles.header}>
        <View style={styles.horaContainer}>
          <Text style={styles.horaTexto}>
            {reserva.hora} - {horaFin}
          </Text>
          <Text style={styles.duracionTexto}>1.5 horas</Text>
          <Text style={styles.canchaTexto}>
            {reserva.canchaNombre || reserva.canchaId}
          </Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
          <Text style={styles.estadoTexto}>{reserva.estado}</Text>
        </View>
      </View>

      {/* CUERPO DEL CARD */}
      <View style={styles.cuerpo}>
        <View style={styles.usuarioContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          <View style={styles.usuarioInfo}>
            <Text style={styles.usuarioNombre}>
              {reserva.usuarioNombre || 'Usuario Desconocido'}
            </Text>
            <Text style={styles.usuarioEmail}>
              {reserva.usuarioEmail || 'Sin email'}
            </Text>
          </View>
        </View>

        {/* Imagen de la cancha (thumbnail pequeño) */}
        {reserva.canchaImagenUrl && (
          <Image
            source={{ uri: reserva.canchaImagenUrl }}
            style={styles.canchaThumbnail}
            onError={() => console.log('Error cargando imagen de cancha')}
          />
        )}
      </View>

      {/* Información de pago */}
      <View style={styles.pagoContainer}>
        <View style={styles.pagoInfo}>
          <Ionicons name="cash-outline" size={16} color={colors.gray600} />
          <Text style={styles.precioTexto}>$5,000</Text>
        </View>
        <Text style={styles.separador}>|</Text>
        <View style={styles.pagoInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.pagoEstadoTexto}>Pagado</Text>
        </View>
      </View>

      {/* FOOTER DEL CARD - BOTONES DE ACCIÓN */}
      <View style={styles.footer}>
        {reserva.estado?.toLowerCase() === 'pendiente' && (
          <>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonConfirmar]}
              onPress={() => handleAccion('confirmar')}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.botonConfirmarTexto}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonCancelar]}
              onPress={() => handleAccion('cancelar')}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => handleAccion('contactar')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward" size={16} color={colors.brandBlue} />
              <Text style={styles.botonSecundarioTexto}>Ver más</Text>
            </TouchableOpacity>
          </>
        )}

        {reserva.estado?.toLowerCase() === 'confirmada' && (
          <>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonEnCurso]}
              onPress={() => handleAccion('contactar')}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.botonEnCursoTexto}>En curso</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonCancelar]}
              onPress={() => handleAccion('cancelar')}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => handleAccion('contactar')}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color={colors.brandGreen} />
              <Text style={[styles.botonSecundarioTexto, { color: colors.brandGreen }]}>Contactar</Text>
            </TouchableOpacity>
          </>
        )}

        {(reserva.estado?.toLowerCase() === 'completada' || reserva.estado?.toLowerCase() === 'cancelada') && (
          <TouchableOpacity 
            style={[styles.botonAccion, styles.botonSecundario]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="eye" size={16} color={colors.gray600} />
            <Text style={[styles.botonSecundarioTexto, { color: colors.gray600 }]}>Ver detalles</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // HEADER DEL CARD
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  horaContainer: {
    flex: 1,
  },
  horaTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 2,
  },
  duracionTexto: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  canchaTexto: {
    fontSize: 16,
    color: colors.gray600,
    fontWeight: '500',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // CUERPO DEL CARD
  cuerpo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usuarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    color: colors.brandBlue,
    fontSize: 16,
    fontWeight: 'bold',
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandBlue,
    marginBottom: 2,
  },
  usuarioEmail: {
    fontSize: 13,
    color: '#999999',
  },
  canchaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },

  // INFORMACIÓN DE PAGO
  pagoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  pagoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  precioTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginLeft: 4,
  },
  separador: {
    fontSize: 14,
    color: colors.gray400,
    marginHorizontal: 12,
  },
  pagoEstadoTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginLeft: 4,
  },

  // FOOTER DEL CARD - BOTONES DE ACCIÓN
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  botonConfirmar: {
    backgroundColor: '#4CAF50',
  },
  botonConfirmarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  botonCancelar: {
    backgroundColor: '#EF5350',
  },
  botonCancelarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  botonEnCurso: {
    backgroundColor: '#2196F3',
  },
  botonEnCursoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.brandBlue,
  },
  botonSecundarioTexto: {
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});
