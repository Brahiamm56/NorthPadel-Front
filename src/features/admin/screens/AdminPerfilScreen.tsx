import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getSavedUser, logout as authLogout, type Usuario } from '../../auth/services/authentication.service';
import { getClubInfo, type ClubInfo } from '../../canchas/services/club.service';
import { updateClubLogo } from '../../canchas/services/club.service';
import { useTheme } from '../../../features/auth/contexts/ThemeContext';

// Colores de marca definidos
const brandColors = {
  navyBlue: '#001F5B',
  limeGreen: '#C4D600',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  textGray: '#666666',
};

// Componente para opciones del menú
const MenuOption = ({ 
  icon, 
  text, 
  onPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  text: string; 
  onPress: () => void 
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuOptionContent}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} style={styles.menuIcon} />
        <Text style={[styles.menuOptionText, { color: theme.colors.text }]}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

// Componente para tarjetas de estadísticas
const StatCard = ({ value, label }: { value: string | number; label: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.statValue, { color: theme.colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

// Componente para grupos de menú
const MenuGroup = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.menuGroup}>
      <Text style={[styles.menuGroupTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.menuGroupContent, { backgroundColor: theme.colors.surface }]}>
        {children}
      </View>
    </View>
  );
};

const AdminPerfilScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState<Usuario | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, clubData] = await Promise.all([
          getSavedUser(),
          getClubInfo(),
        ]);
        
        setUser(userData);
        setClubInfo(clubData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setError('No se pudieron cargar los datos del perfil');
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    try {
      // Solicitar permisos para acceder a la galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería de fotos');
        return;
      }
      
      // Abrir el selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        
        // Mostrar indicador de carga
        setImageLoading(true);
        
        try {
          // Actualizar el logo en el servidor/servicio
          const updatedClubInfo = await updateClubLogo(selectedImageUri);
          
          // Actualizar el estado local con la nueva información
          setClubInfo(updatedClubInfo);
          
          Alert.alert('Éxito', 'La imagen de perfil se ha actualizado correctamente');
        } catch (error) {
          console.error('Error al actualizar la imagen:', error);
          Alert.alert('Error', 'No se pudo actualizar la imagen de perfil');
        } finally {
          setImageLoading(false);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'Ocurrió un problema al seleccionar la imagen');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authLogout();
              // La navegación se manejará a través del contexto de autenticación
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    console.log('Navegando a editar perfil...');
  };

  const handleSettings = () => {
    console.log('Navegando a configuración general...');
  };

  const handleChangePassword = () => {
    console.log('Navegando a cambiar contraseña...');
  };

  const handlePersonalInfo = () => {
    console.log('Navegando a información personal...');
  };

  const handleManageCourts = () => {
    console.log('Navegando a gestión de canchas...');
  };

  const handleManageReservations = () => {
    console.log('Navegando a gestión de reservas...');
  };

  const handleBusinessStats = () => {
    console.log('Navegando a estadísticas del negocio...');
  };

  const handleNotifications = () => {
    console.log('Navegando a notificaciones...');
  };

  const handleAppearance = () => {
    console.log('Navegando a apariencia...');
  };

  // Obtener iniciales del nombre para el avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColors.navyBlue} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estadísticas predeterminadas
  const hasStatsData = true;  // Siempre mostrar estadísticas
  
  // Calcular estadísticas
  const canchasCount = 3;  // Valor predeterminado
  const reservasCount = 15;  // Valor predeterminado
  const rating = 4.8;  // Valor predeterminado

  // Nombre del usuario o club
  const displayName = user?.nombre || clubInfo?.nombre || 'Brahiam Iserre';
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con Avatar e Información */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {/* Ícono de configuración */}
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        {/* Avatar */}
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {imageLoading ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator size="small" color={brandColors.navyBlue} />
            </View>
          ) : clubInfo?.logoUrl ? (
            <View>
              <Image
                source={{ uri: clubInfo.logoUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color={brandColors.white} />
              </View>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {getInitials(displayName)}
              </Text>
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color={brandColors.white} />
              </View>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Información del usuario */}
        <Text style={[styles.userName, { color: theme.colors.text }]}>{displayName}</Text>
        <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>🏢 Administrador</Text>
        
        {/* Botón Editar Perfil */}
        <TouchableOpacity 
          style={[styles.editProfileButton, { borderColor: theme.colors.primary }]} 
          onPress={handleEditProfile}
        >
          <Text style={[styles.editProfileButtonText, { color: theme.colors.primary }]}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Mini Stats Cards (condicional) */}
      {hasStatsData && (
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <StatCard value={canchasCount} label="Canchas" />
          <StatCard value={reservasCount} label="Reservas" />
          <StatCard value={rating.toFixed(1)} label="Rating" />
        </View>
      )}

      {/* Menú de Opciones Agrupadas */}
      <View style={styles.menuContainer}>
        {/* Grupo MI CUENTA */}
        <MenuGroup title="MI CUENTA">
          <MenuOption 
            icon="person-outline" 
            text="Información Personal" 
            onPress={handlePersonalInfo} 
          />
          <View style={styles.divider} />
          <MenuOption 
            icon="key-outline" 
            text="Cambiar Contraseña" 
            onPress={handleChangePassword} 
          />
        </MenuGroup>

        {/* Grupo MI NEGOCIO */}
        <MenuGroup title="MI NEGOCIO">
          <MenuOption 
            icon="stats-chart-outline" 
            text="Estadísticas" 
            onPress={handleBusinessStats} 
          />
        </MenuGroup>

        {/* Grupo AJUSTES */}
        <MenuGroup title="AJUSTES">
          <MenuOption 
            icon="notifications-outline" 
            text="Notificaciones" 
            onPress={handleNotifications} 
          />
          <View style={styles.divider} />
          
          {/* Opción de Modo Oscuro con Switch */}
          <View style={styles.menuOption}>
            <View style={styles.menuOptionContent}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={22} 
                color={theme.colors.textSecondary} 
                style={styles.menuIcon} 
              />
              <Text style={[styles.menuOptionText, { color: theme.colors.text }]}>
                Modo Oscuro
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: theme.colors.secondary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
        </MenuGroup>
      </View>

      {/* Botón Cerrar Sesión */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#D32F2F' : '#FF3B30' }]} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.white,
  },
  loadingText: {
    marginTop: 16,
    color: brandColors.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: brandColors.white,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: brandColors.navyBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: brandColors.white,
    fontWeight: '600',
  },
  // Header styles
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: brandColors.lightGray,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    right: 20,
    padding: 8,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: brandColors.white,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: brandColors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: brandColors.white,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: brandColors.navyBlue,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: brandColors.navyBlue,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: brandColors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: brandColors.navyBlue,
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 14,
    color: brandColors.textGray,
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: brandColors.navyBlue,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: brandColors.navyBlue,
  },
  // Stats cards styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: brandColors.white,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: brandColors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: brandColors.navyBlue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: brandColors.textGray,
    textAlign: 'center',
  },
  // Menu styles
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuGroup: {
    marginBottom: 16,
  },
  menuGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: brandColors.textGray,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuGroupContent: {
    backgroundColor: brandColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 16,
    color: brandColors.navyBlue,
  },
  divider: {
    height: 1,
    backgroundColor: brandColors.lightGray,
    marginLeft: 50,
  },
  // Logout button
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminPerfilScreen;