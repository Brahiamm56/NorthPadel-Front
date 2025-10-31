import React, { useState, useEffect, useMemo } from 'react';
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getComplejosConCanchas, type Complejo, type Cancha } from '../../services/canchasService';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { useTheme } from '../../context/ThemeContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CanchasStackParamList } from '../../navigation/UserTabNavigator';

type Props = NativeStackScreenProps<CanchasStackParamList, 'CanchasHome'>;

/**
 * Pantalla de Canchas - Vista del Cliente
 * Aquí el usuario podrá ver las canchas disponibles y hacer reservas
 */
const CanchasScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
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


  // Renderizar tarjeta de cancha (nuevo diseño horizontal)
  const renderCanchaCard = (item: Cancha, complejo: Complejo) => {
    // Determinar disponibilidad de horarios (simulado para el diseño)
    const horariosDisponibles = item.horariosDisponibles || Math.floor(Math.random() * 6);
    
    // Determinar color y texto según disponibilidad
    let disponibilidadColor = '#4CAF50'; // Verde
    let disponibilidadIcon = '🟢';
    let disponibilidadText = `${horariosDisponibles} horarios disponibles hoy`;
    
    if (horariosDisponibles === 0) {
      disponibilidadColor = '#F44336'; // Rojo
      disponibilidadIcon = '🔴';
      disponibilidadText = 'Sin horarios disponibles hoy';
    } else if (horariosDisponibles < 3) {
      disponibilidadColor = '#FFC107'; // Amarillo
      disponibilidadIcon = '🟡';
    }
    
    // Características de la cancha (usar las que existan en los datos)
    const caracteristicas = [];
    if (item.techada) caracteristicas.push('Techada');
    if (item.iluminacion) caracteristicas.push('Iluminación LED');
    if (item.blindex) caracteristicas.push('Blindex');
    if (item.cesped) caracteristicas.push('Césped Sintético');
    
    return (
      <TouchableOpacity
        style={[styles.canchaCardHorizontal, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleCanchaPress(item, complejo)}
        activeOpacity={0.95}
      >
        {/* Imagen de la cancha */}
        {item.imagenUrl ? (
          <Image
            source={{ uri: item.imagenUrl }}
            style={styles.canchaImageHorizontal}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.canchaImageHorizontal, { backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="tennisball-outline" size={40} color="#CCCCCC" />
          </View>
        )}
        
        {/* Información de la cancha */}
        <View style={styles.canchaInfoContainer}>
          {/* Header: Nombre y Precio */}
          <View style={styles.canchaHeader}>
            <Text style={[styles.canchaNameHorizontal, { color: theme.colors.text }]} numberOfLines={1}>
              {item.nombre.toUpperCase()}
            </Text>
            <Text style={[styles.canchaPriceHorizontal, { color: theme.colors.secondary }]}>
              ${item.precioHora}/hr
            </Text>
          </View>
          
          {/* Características */}
          {caracteristicas.length > 0 && (
            <View style={styles.caracteristicasContainer}>
              {caracteristicas.map((caracteristica, index) => (
                <View key={index} style={styles.caracteristicaItem}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={14} 
                    color="#4CAF50" 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={styles.caracteristicaText}>
                    {caracteristica}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Disponibilidad */}
          <View style={styles.disponibilidadContainer}>
            <View 
              style={[
                styles.puntoDisponibilidad, 
                { backgroundColor: disponibilidadColor }
              ]} 
            />
            <Text style={styles.disponibilidadText}>
              {horariosDisponibles} horarios disponibles hoy
            </Text>
          </View>
          
          {/* Botón Ver Horarios */}
          <TouchableOpacity 
            style={styles.verHorariosButton}
            onPress={() => handleCanchaPress(item, complejo)}
          >
            <Text style={styles.verHorariosText}>Ver Horarios</Text>
            <Ionicons name="arrow-forward" size={16} color="#001F5B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Filtrar complejos según la búsqueda
  const complejosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) {
      return complejos;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return complejos.filter(complejo => {
      // Verificar si el nombre del complejo coincide
      if (complejo.nombre.toLowerCase().includes(query)) {
        return true;
      }
      
      // Verificar si alguna cancha del complejo coincide
      return complejo.canchas.some(cancha => 
        cancha.nombre.toLowerCase().includes(query)
      );
    });
  }, [complejos, searchQuery]);

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando canchas...</Text>
      </View>
    );
  }

  // Renderizar la sección de información del complejo
  const renderComplejoInfo = (complejo: Complejo) => (
    <View style={[styles.complejoInfoContainer, { backgroundColor: theme.colors.surface }]}>
      {/* Primera línea: Nombre + Distancia */}
      <View style={styles.complejoHeaderRow}>
        <Text style={[styles.complejoNombre, { color: theme.colors.text }]} numberOfLines={1}>
          {complejo.nombre}
        </Text>
        
        {complejo.distancia && (
          <View style={styles.distanciaContainer}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.distanciaText, { color: theme.colors.textSecondary }]}>
              {complejo.distancia} km
            </Text>
          </View>
        )}
      </View>
      
      {/* Segunda línea: Rating + Dirección */}
      <View style={styles.complejoInfoRow}>
        {complejo.rating && (
          <>
            <View style={styles.ratingContainer}>
              <Text style={{ color: '#FFD700', marginRight: 2 }}>⭐</Text>
              <Text style={[styles.ratingValue, { color: theme.colors.text }]}>
                {complejo.rating}
              </Text>
              <Text style={[styles.reviewsText, { color: theme.colors.textSecondary }]}>
                ({complejo.reviewsCount || 0} reseñas)
              </Text>
            </View>
            
            {complejo.direccion && (
              <>
                <Text style={[styles.separador, { color: theme.colors.textSecondary }]}> • </Text>
                <Text style={[styles.direccionText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {complejo.direccion}
                </Text>
              </>
            )}
          </>
        )}
        
        {!complejo.rating && complejo.direccion && (
          <Text style={[styles.direccionText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {complejo.direccion}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando canchas...</Text>
        </View>
      ) : complejosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="tennisball-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() 
              ? `No se encontraron resultados para "${searchQuery}"`
              : "No hay canchas disponibles"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? "Intenta con otra búsqueda"
              : "Vuelve a intentarlo más tarde"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={complejosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: complejo }) => (
            <View style={styles.complejoContainer}>
              {/* Información del complejo */}
              {renderComplejoInfo(complejo)}
              
              {/* Lista de canchas del complejo */}
              {complejo.canchas.map((cancha) => (
                <View key={cancha.id}>
                  {renderCanchaCard(cancha, complejo)}
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  complejoContainer: {
    marginBottom: 24,
  },
  
  // Estilos para la sección de información del complejo
  complejoInfoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  complejoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  complejoNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  distanciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanciaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  complejoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 13,
  },
  separador: {
    fontSize: 13,
    marginHorizontal: 4,
  },
  direccionText: {
    fontSize: 13,
    flex: 1,
  },
  
  // Estilos para las cards de canchas (nuevo diseño horizontal)
  canchaCardHorizontal: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  disponibilidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  puntoDisponibilidad: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  canchaImageHorizontal: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 16,
  },
  canchaInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  canchaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  canchaNameHorizontal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F5B',
    flex: 1,
    marginRight: 8,
  },
  canchaPriceHorizontal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4D600',
  },
  caracteristicasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 6,
  },
  caracteristicaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  caracteristicaText: {
    fontSize: 12,
    color: '#666666',
  },
  disponibilidadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  verHorariosButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4D600',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verHorariosText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001F5B',
    marginRight: 4,
  },
  
  // Estilos para estados vacíos y errores
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
