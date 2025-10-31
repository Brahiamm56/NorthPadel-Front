import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  onVerOtroDia?: () => void;
  onCrearReserva?: () => void;
  mensaje?: string;
  subMensaje?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onVerOtroDia,
  onCrearReserva,
  mensaje = 'No hay reservas para este día',
  subMensaje = 'Selecciona otra fecha o crea una nueva reserva',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={80} color={colors.gray300} />
      </View>
      
      <Text style={styles.titulo}>{mensaje}</Text>
      <Text style={styles.subtitulo}>{subMensaje}</Text>
      
      <View style={styles.botonesContainer}>
        {onVerOtroDia && (
          <TouchableOpacity 
            style={styles.botonSecundario}
            onPress={onVerOtroDia}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={16} color={colors.brandBlue} />
            <Text style={styles.botonSecundarioTexto}>Ver otro día</Text>
          </TouchableOpacity>
        )}
        
        {onCrearReserva && (
          <TouchableOpacity 
            style={styles.botonPrimario}
            onPress={onCrearReserva}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.botonPrimarioTexto}>Crear reserva</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandBlue,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  botonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  botonPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botonPrimarioTexto: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  botonSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brandBlue,
  },
  botonSecundarioTexto: {
    color: colors.brandBlue,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
