import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { CanchaDisponible } from './CanchaDisponible';

interface CanchasDisponiblesProps {
  canchas: Array<{
    id: string;
    nombre: string;
    imagenUrl?: string;
    precioHora?: number;
    disponible?: boolean;
  }>;
  busqueda: string;
  onCanchaPress: (canchaId: string) => void;
}

export const CanchasDisponibles: React.FC<CanchasDisponiblesProps> = ({
  canchas,
  busqueda,
  onCanchaPress,
}) => {
  // Filtrar canchas por búsqueda
  const canchasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return canchas;
    
    return canchas.filter(cancha =>
      cancha.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [canchas, busqueda]);

  const renderCancha = ({ item }: { item: any }) => (
    <CanchaDisponible
      cancha={item}
      onPress={() => onCanchaPress(item.id)}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyTitle}>
        {busqueda.trim() ? 'No se encontraron canchas' : 'No hay canchas disponibles'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {busqueda.trim() 
          ? `No hay canchas que coincidan con "${busqueda}"`
          : 'No hay canchas registradas en el sistema'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header con información */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Canchas Disponibles</Text>
        <Text style={styles.headerSubtitle}>
          {canchasFiltradas.length} cancha{canchasFiltradas.length !== 1 ? 's' : ''} encontrada{canchasFiltradas.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de canchas */}
      <FlatList
        data={canchasFiltradas}
        renderItem={renderCancha}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray600,
  },
  listContent: {
    paddingTop: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandBlue,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
});
