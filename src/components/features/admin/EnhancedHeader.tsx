import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface HeaderMejoradoProps {
  totalReservasDia: number;
  busqueda: string;
  onBusquedaChange: (texto: string) => void;
  onFiltrosAvanzados: () => void;
}

export const HeaderMejorado: React.FC<HeaderMejoradoProps> = ({
  totalReservasDia,
  busqueda,
  onBusquedaChange,
  onFiltrosAvanzados,
}) => {
  return (
    <View style={styles.container}>
      {/* Título con badge */}
      <View style={styles.tituloContainer}>
        <View style={styles.tituloYBadge}>
          <Text style={styles.titulo}>Reservas</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeTexto}>{totalReservasDia}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.filtrosButton}
          onPress={onFiltrosAvanzados}
          activeOpacity={0.7}
        >
          <Ionicons name="options" size={20} color={colors.brandBlue} />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.busquedaContainer}>
        <View style={styles.busquedaInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999999" style={styles.busquedaIcon} />
          <TextInput
            style={styles.busquedaInput}
            placeholder="Buscar por usuario o email..."
            placeholderTextColor="#999999"
            value={busqueda}
            onChangeText={onBusquedaChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            selectionColor={colors.brandBlue}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onBusquedaChange('')}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#999999" />
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  // Título con badge
  tituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tituloYBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginRight: 12,
  },
  badgeContainer: {
    backgroundColor: colors.brandGreen,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeTexto: {
    color: colors.brandBlue,
    fontSize: 14,
    fontWeight: 'bold',
  },
  filtrosButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  // Barra de búsqueda
  busquedaContainer: {
    marginTop: 12,
  },
  busquedaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    height: 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  busquedaIcon: {
    marginRight: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 15,
    color: colors.brandBlue,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    height: '100%',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});
