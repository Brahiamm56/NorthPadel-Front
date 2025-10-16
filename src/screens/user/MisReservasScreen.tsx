import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMisReservas } from '../../services/reservasService'; // Asegúrate que la ruta es correcta
import { colors } from '../../theme/colors'; // Asegúrate que la ruta es correcta

// Definimos el tipo para una reserva, debe coincidir con lo que envía el backend
type Reserva = {
  id: string;
  fecha: string;
  hora: string;
  canchaId: string; // Puedes añadir más campos como canchaNombre si el backend los envía
  complejoId: string;
  estado: string;
};

const MisReservasScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'proximas' | 'anteriores'>('proximas');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarReservas = async () => {
    setLoading(true);
    try {
      console.log(`🔵 Cargando reservas: ${activeTab}`);
      // Llama a la función que obtiene los datos reales del backend
      const data = await getMisReservas(activeTab);
      // Aquí podrías formatear la fecha o cualquier otro dato si es necesario
      setReservas(data);
    } catch (error) {
      console.error('🔴 Error al cargar las reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  };
  
  // useFocusEffect se ejecuta cada vez que la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      cargarReservas();
    }, [activeTab]) // Se vuelve a ejecutar si cambia la pestaña activa
  );

  const renderReservaCard = ({ item }: { item: Reserva }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {item.hora}</Text>
        <View style={[styles.statusBadge, item.estado === 'Confirmada' ? styles.statusConfirmed : styles.statusDefault]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>Cancha ID: {item.canchaId}</Text>
        <Text style={styles.cardSubtitle}>Complejo ID: {item.complejoId}</Text>
      </View>
      {activeTab === 'proximas' && (
         <TouchableOpacity style={styles.cancelButton}>
           <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
         </TouchableOpacity>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎾</Text>
      <Text style={styles.emptyTitle}>No tienes reservas {activeTab}</Text>
      <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Canchas')}>
        <Text style={styles.exploreButtonText}>Explorar Canchas</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'proximas' && styles.activeTab]}
          onPress={() => setActiveTab('proximas')}
        >
          <Text style={[styles.tabText, activeTab === 'proximas' && styles.activeTabText]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'anteriores' && styles.activeTab]}
          onPress={() => setActiveTab('anteriores')}
        >
          <Text style={[styles.tabText, activeTab === 'anteriores' && styles.activeTabText]}>Anteriores</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reservas}
          renderItem={renderReservaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#212529',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        marginHorizontal: 8,
    },
    activeTab: {
        backgroundColor: '#007bff',
    },
    tabText: {
        color: '#495057',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#ffffff',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    statusConfirmed: {
        backgroundColor: '#d4edda', // Verde claro
    },
    statusDefault: {
        backgroundColor: '#e9ecef',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#155724', // Verde oscuro
    },
    cardBody: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    cancelButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    cancelButtonText: {
        color: '#dc3545',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
        color: '#ced4da',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#212529',
    },
    exploreButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MisReservasScreen;
