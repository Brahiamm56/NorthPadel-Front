import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getComplejosConCanchas, type Complejo, type Cancha } from '../../services/canchasService';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CanchasStackParamList } from '../../navigation/UserTabNavigator';

type Props = NativeStackScreenProps<CanchasStackParamList, 'CanchasHome'>;

/**
 * Pantalla de Canchas - Vista del Cliente
 * Aquí el usuario podrá ver las canchas disponibles y hacer reservas
 */
const CanchasScreen = ({ navigation }: Props) => {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar complejos con canchas al montar el componente
  useEffect(() => {
    loadComplejos();
  }, []);

  const loadComplejos = async () => {
    try {
      console.log('🔵 Cargando complejos y canchas...');
      const data = await getComplejosConCanchas();
      console.log('🔵 Datos cargados:', data);
      setComplejos(data);
    } catch (error) {
      console.error('🔴 Error al cargar complejos:', error);
      Alert.alert('Error', 'No se pudieron cargar las canchas');
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    console.log('Buscando:', text);
    // TODO: Implementar filtrado de canchas
  };

  // Manejar notificaciones
  const handleNotifications = () => {
    console.log('Abriendo notificaciones...');
    // TODO: Navegar a pantalla de notificaciones
  };

  // Manejar selección de cancha
  const handleCanchaPress = (cancha: Cancha, complejo: Complejo) => {
    // Lógica del "Directorio Inteligente"
    if (complejo.isVerified) {
      // Si el complejo está verificado, navegar al detalle
      navigation.navigate('CanchaDetalle', {
        canchaId: cancha.id,
        complejoId: complejo.id
      });
    } else {
      // Si no está verificado, mostrar opción de llamar
      Alert.alert(
        'Complejo no verificado',
        `¿Quieres llamar a ${complejo.nombre} para reservar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar',
            onPress: () => {
              // Aquí iría el teléfono del complejo
              const phoneNumber = complejo.telefono || 'tel:+5491123456789'; // Placeholder
              Linking.openURL(phoneNumber);
            }
          }
        ]
      );
    }
  };


  // Renderizar tarjeta de cancha
  const renderCanchaCard = (item: Cancha, complejo: Complejo) => (
    <TouchableOpacity
      style={styles.canchaCard}
      onPress={() => handleCanchaPress(item, complejo)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imagenUrl }}
        style={styles.canchaImage}
        resizeMode="cover"
      />
      <View style={styles.canchaInfo}>
        <Text style={styles.canchaName} numberOfLines={1}>
          {item.nombre}
        </Text>
        <Text style={styles.canchaPrice}>${item.precioHora} / hr</Text>
        {!complejo.isVerified && (
          <View style={styles.callLabel}>
            <Ionicons name="call" size={12} color={colors.primary} />
            <Text style={styles.callText}>Llamar</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando canchas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra superior con buscador y notificaciones */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar canchas o complejos..."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotifications}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Lista de complejos con sus canchas */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {complejos.map((complejo) => (
          <View key={complejo.id} style={styles.complejoSection}>
            <Text style={styles.complejoTitle}>{complejo.nombre}</Text>
            <FlatList
              data={complejo.canchas}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderCanchaCard(item, complejo)}
              contentContainerStyle={styles.canchasList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay canchas disponibles</Text>
              }
            />
          </View>
        ))}

        {complejos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="tennisball-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>No hay canchas disponibles</Text>
            <Text style={styles.emptySubtitle}>
              Vuelve a intentarlo más tarde
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  notificationButton: {
    marginLeft: spacing.md,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  scrollView: {
    flex: 1,
  },
  complejoSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  complejoTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  canchasList: {
    paddingHorizontal: spacing.lg,
  },
  canchaCard: {
    width: 160,
    height: 180,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canchaImage: {
    width: '100%',
    height: 110,
    backgroundColor: colors.background,
  },
  canchaInfo: {
    padding: spacing.sm,
  },
  canchaName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  canchaPrice: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
  },
  callLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  callText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
  },
});

export default CanchasScreen;
