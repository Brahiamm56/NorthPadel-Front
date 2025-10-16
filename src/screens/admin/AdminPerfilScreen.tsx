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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSavedUser, logout as authLogout, type Usuario } from '../../services/authService';
import { getClubInfo, type ClubInfo } from '../../services/clubService';
import { colors } from '../../theme/colors';

const ProfileOption = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
  </TouchableOpacity>
);

const AdminPerfilScreen = () => {
  console.log('🔵 1. Componente AdminPerfilScreen montado');
  const [user, setUser] = useState<Usuario | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 2. useEffect ejecutándose');
    const loadData = async () => {
      console.log('🔵 3. Cargando datos del perfil...');
      try {
        const [userData, clubData] = await Promise.all([
          getSavedUser(),
          getClubInfo(),
        ]);
        
        console.log('🔵 4. Datos cargados:', { userData, clubData });
        
        setUser(userData);
        setClubInfo(clubData);
        setError(null);
        console.log('🔵 5. Estados actualizados correctamente');
      } catch (err) {
        console.error('🔴 Error al cargar los datos:', err);
        setError('No se pudieron cargar los datos del perfil');
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
      } finally {
        console.log('🔵 6. Finalizando carga de datos, loading = false');
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleChangePassword = () => {
    console.log('Navegando a cambiar contraseña...');
  };

  const handleNotifications = () => {
    console.log('Navegando a notificaciones...');
  };

  if (loading) {
    console.log('🟡 Mostrando indicador de carga');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    console.log('🔴 Mostrando pantalla de error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            console.log('Reintentando cargar datos...');
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('🟢 Mostrando contenido del perfil', { user, clubInfo });
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ 
            uri: clubInfo?.logoUrl || 'https://placehold.co/100x100/28a745/FFFFFF/png?text=Logo' 
          }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.clubName}>{clubInfo?.nombre || 'North Padel Club'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'admin@northpadel.com'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CUENTA</Text>
        <View style={styles.sectionContent}>
          <ProfileOption
            text="Cambiar Contraseña"
            onPress={handleChangePassword}
          />
          <View style={styles.divider} />
          <ProfileOption
            text="Notificaciones"
            onPress={handleNotifications}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: colors.gray100,
  },
  clubName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  logoutButton: {
    margin: 24,
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminPerfilScreen;