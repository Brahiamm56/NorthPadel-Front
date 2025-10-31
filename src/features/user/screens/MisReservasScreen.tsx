import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMisReservas, cancelarReserva } from '../../../features/reservas/services/reservations.service';
import { colors } from '../../../styles/colors';
import { spacing, fontSize, borderRadius } from '../../../styles/spacing';
import { ReservaConCancha } from '../../types/reservas.types';

const MisReservasScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'proximas' | 'anteriores'>('proximas');
  const [reservas, setReservas] = useState<ReservaConCancha[]>([]);
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

  const handleCancelarReserva = async (reservaId: string) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarReserva(reservaId);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              cargarReservas(); // Recargar reservas
            } catch (error) {
              console.error('Error cancelando reserva:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const renderReservaCard = ({ item }: { item: ReservaConCancha }) => {
    const getStatusColor = () => {
      switch (item.estado) {
        case 'Confirmada':
          return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
        case 'Cancelada':
          return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
        case 'Pendiente':
          return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
        default:
          return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
      }
    };

    const statusColors = getStatusColor();

    return (
      <View style={[styles.card, { borderLeftColor: statusColors.border, borderLeftWidth: 4 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            {item.canchaImagenUrl && (
              <Image source={{ uri: item.canchaImagenUrl }} style={styles.cardImage} />
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.canchaNombre || 'Cancha'}</Text>
              <Text style={styles.cardTime}>{item.hora}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.estado === 'Confirmada' ? '✓ CONFIRMADA' :
               item.estado === 'Cancelada' ? '✕ CANCELADA' :
               item.estado === 'Pendiente' ? '⏳ PENDIENTE' : item.estado}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDate}>
          {new Date(item.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Ver detalles</Text>
          </TouchableOpacity>
          {item.estado === 'Confirmada' && activeTab === 'proximas' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelarReserva(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👋 Hola, Usuario</Text>
        <Text style={styles.headerSubtitle}>Tus Reservas</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'proximas' && styles.activeTab]}
          onPress={() => setActiveTab('proximas')}
        >
          <Text style={[styles.tabText, activeTab === 'proximas' && styles.activeTabText]}>
            Próximas ({reservas.filter(
              (reserva) => {
                // Comparar fechas como strings YYYY-MM-DD para evitar problemas de zona horaria
                const hoy = new Date().toISOString().split('T')[0];
                return reserva.fecha >= hoy && reserva.estado !== 'Cancelada';
              }
            ).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'anteriores' && styles.activeTab]}
          onPress={() => setActiveTab('anteriores')}
        >
          <Text style={[styles.tabText, activeTab === 'anteriores' && styles.activeTabText]}>
            Anteriores ({reservas.filter(r => r.estado === 'Cancelada').length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          renderItem={renderReservaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    marginHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  activeTabText: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardPrice: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  detailButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  exploreButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});

export default MisReservasScreen;
