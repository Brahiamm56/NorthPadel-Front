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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getComplejosConCanchas, type Complejo, type Cancha } from '../../services/canchasService';
import { colors } from '../../theme/colors';
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
  const handleCanchaPress = (cancha: Cancha, complejoId: string) => {
  navigation.navigate('CanchaDetalle', { 
    canchaId: cancha.id,
    complejoId: complejoId 
  });
};


  // Renderizar tarjeta de cancha
  const renderCanchaCard = (item: Cancha, complejoId: string) => (
    <TouchableOpacity
      style={styles.canchaCard}
      onPress={() => handleCanchaPress(item, complejoId)}
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
        <Text style={styles.canchaPrice}>{item.precioHora} / hr</Text>
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
              renderItem={({ item }) => renderCanchaCard(item, complejo.id)}
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
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  notificationButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  complejoSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  complejoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  canchasList: {
    paddingHorizontal: 16,
  },
  canchaCard: {
    width: 160,
    height: 180,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: 12,
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
    backgroundColor: colors.gray200,
  },
  canchaInfo: {
    padding: 10,
  },
  canchaName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  canchaPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 16,
  },
});

export default CanchasScreen;
