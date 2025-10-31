import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface FiltrosMejoradosProps {
  filtroEstado: 'todas' | 'pendientes' | 'confirmadas' | 'canceladas';
  onFiltroEstadoChange: (filtro: 'todas' | 'pendientes' | 'confirmadas' | 'canceladas') => void;
  canchaSeleccionada: string;
  onCanchaChange: (canchaId: string) => void;
  canchasDisponibles: Array<{ id: string; nombre: string }>;
  conteosPorEstado: {
    todas: number;
    pendientes: number;
    confirmadas: number;
    canceladas: number;
  };
  busquedaCanchas?: string;
  onBusquedaCanchasChange?: (texto: string) => void;
}

export const FiltrosMejorados: React.FC<FiltrosMejoradosProps> = ({
  filtroEstado,
  onFiltroEstadoChange,
  canchaSeleccionada,
  onCanchaChange,
  canchasDisponibles,
  conteosPorEstado,
  busquedaCanchas = '',
  onBusquedaCanchasChange,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const tabs = [
    { key: 'todas', label: 'Todas', count: conteosPorEstado.todas },
    { key: 'pendientes', label: 'Pendientes', count: conteosPorEstado.pendientes },
    { key: 'confirmadas', label: 'Confirmadas', count: conteosPorEstado.confirmadas },
    { key: 'canceladas', label: 'Canceladas', count: conteosPorEstado.canceladas },
  ];

  const canchaSeleccionadaNombre = canchasDisponibles.find(c => c.id === canchaSeleccionada)?.nombre || 'Todas las canchas';

  return (
    <View style={styles.container}>
      {/* Tabs de estado */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              filtroEstado === tab.key && styles.tabActivo,
            ]}
            onPress={() => onFiltroEstadoChange(tab.key as any)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabTexto,
                filtroEstado === tab.key && styles.tabTextoActivo,
              ]}
            >
              {tab.label}
            </Text>
            <Text
              style={[
                styles.tabCount,
                filtroEstado === tab.key && styles.tabCountActivo,
              ]}
            >
              ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicador de tab activo */}
      <View style={styles.indicadorContainer}>
        <View style={styles.indicadorLinea} />
        <View 
          style={[
            styles.indicadorActivo,
            { 
              left: tabs.findIndex(tab => tab.key === filtroEstado) * (100 / tabs.length) + '%',
              width: `${100 / tabs.length}%`,
            }
          ]} 
        />
      </View>

      {/* Sección de Disponibilidad de Canchas */}
      <View style={styles.disponibilidadContainer}>
        <Text style={styles.disponibilidadTitulo}>Disponibilidad de Canchas</Text>
        
        {/* Barra de búsqueda para canchas */}
        {onBusquedaCanchasChange && (
          <View style={styles.busquedaCanchasContainer}>
            <View style={styles.busquedaCanchasInputContainer}>
              <Ionicons name="search" size={18} color={colors.gray500} style={styles.busquedaCanchasIcon} />
              <TextInput
                style={styles.busquedaCanchasInput}
                placeholder="Buscar canchas..."
                placeholderTextColor={colors.gray500}
                value={busquedaCanchas}
                onChangeText={onBusquedaCanchasChange}
                returnKeyType="search"
              />
              {busquedaCanchas.length > 0 && (
                <TouchableOpacity
                  style={styles.clearCanchasButton}
                  onPress={() => onBusquedaCanchasChange('')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.gray500} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Selector de cancha */}
        <TouchableOpacity
          style={styles.canchaSelector}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.canchaInfo}>
            <Ionicons name="tennisball" size={16} color={colors.brandBlue} />
            <Text style={styles.canchaTexto}>{canchaSeleccionadaNombre}</Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.gray600} />
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar cancha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cancha</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  canchaSeleccionada === 'Todas' && styles.modalItemSeleccionado,
                ]}
                onPress={() => {
                  onCanchaChange('Todas');
                  setModalVisible(false);
                }}
              >
                <View style={styles.modalItemInfo}>
                  <Ionicons name="grid" size={20} color={colors.brandBlue} />
                  <Text style={styles.modalItemTexto}>Todas las canchas</Text>
                </View>
                {canchaSeleccionada === 'Todas' && (
                  <Ionicons name="checkmark" size={20} color={colors.brandGreen} />
                )}
              </TouchableOpacity>

              {canchasDisponibles.map((cancha) => (
                <TouchableOpacity
                  key={cancha.id}
                  style={[
                    styles.modalItem,
                    canchaSeleccionada === cancha.id && styles.modalItemSeleccionado,
                  ]}
                  onPress={() => {
                    onCanchaChange(cancha.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemInfo}>
                    <Ionicons name="tennisball" size={20} color={colors.brandBlue} />
                    <Text style={styles.modalItemTexto}>{cancha.nombre}</Text>
                  </View>
                  {canchaSeleccionada === cancha.id && (
                    <Ionicons name="checkmark" size={20} color={colors.brandGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  // Tabs de estado
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    minWidth: 100,
  },
  tabActivo: {
    backgroundColor: colors.brandBlue,
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 2,
  },
  tabTextoActivo: {
    color: colors.white,
  },
  tabCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray500,
  },
  tabCountActivo: {
    color: colors.white,
  },

  // Indicador de tab activo
  indicadorContainer: {
    height: 3,
    marginHorizontal: 16,
    marginTop: 8,
    position: 'relative',
  },
  indicadorLinea: {
    height: 1,
    backgroundColor: colors.gray200,
    width: '100%',
  },
  indicadorActivo: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.brandGreen,
    borderRadius: 2,
    top: -1,
  },

  // Sección de Disponibilidad de Canchas
  disponibilidadContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  disponibilidadTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandBlue,
    marginBottom: 12,
  },
  
  // Búsqueda de canchas
  busquedaCanchasContainer: {
    marginBottom: 12,
  },
  busquedaCanchasInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  busquedaCanchasIcon: {
    marginRight: 8,
  },
  busquedaCanchasInput: {
    flex: 1,
    fontSize: 14,
    color: colors.brandBlue,
    paddingVertical: 0,
  },
  clearCanchasButton: {
    marginLeft: 8,
    padding: 2,
  },
  canchaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  canchaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  canchaTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brandBlue,
    marginLeft: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandBlue,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalItemSeleccionado: {
    backgroundColor: colors.gray50,
  },
  modalItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemTexto: {
    fontSize: 16,
    color: colors.brandBlue,
    marginLeft: 12,
    fontWeight: '500',
  },
});
