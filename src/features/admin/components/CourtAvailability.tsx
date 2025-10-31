import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface CanchaDisponibleProps {
  cancha: {
    id: string;
    nombre: string;
    imagenUrl?: string;
    precioHora?: number;
    disponible?: boolean;
  };
  onPress: () => void;
}

export const CanchaDisponible: React.FC<CanchaDisponibleProps> = ({
  cancha,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Imagen de la cancha */}
      <View style={styles.imagenContainer}>
        {cancha.imagenUrl ? (
          <Image
            source={{ uri: cancha.imagenUrl }}
            style={styles.imagen}
            onError={() => console.log('Error cargando imagen de cancha')}
          />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="tennisball" size={32} color={colors.gray400} />
          </View>
        )}
      </View>

      {/* Información de la cancha */}
      <View style={styles.infoContainer}>
        <Text style={styles.nombreCancha}>{cancha.nombre}</Text>
        
        {cancha.precioHora && (
          <Text style={styles.precioTexto}>
            ${cancha.precioHora.toLocaleString()}/hr
          </Text>
        )}

        <View style={styles.disponibilidadContainer}>
          <Ionicons 
            name={cancha.disponible ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={cancha.disponible ? colors.success : colors.error} 
          />
          <Text style={[
            styles.disponibilidadTexto,
            { color: cancha.disponible ? colors.success : colors.error }
          ]}>
            {cancha.disponible ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>

      {/* Flecha de navegación */}
      <View style={styles.flechaContainer}>
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagenContainer: {
    marginRight: 16,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  imagenPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nombreCancha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 4,
  },
  precioTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen,
    marginBottom: 8,
  },
  disponibilidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disponibilidadTexto: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  flechaContainer: {
    marginLeft: 12,
  },
});
