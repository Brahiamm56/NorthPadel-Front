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
import { getCurrentUserInfo, type UserInfo } from '../services/user.service';
import { logout as authLogout } from '../../../features/auth/services/authentication.service';
import { colors } from '../../../styles/colors';
import { useAuth } from '../../../features/auth/contexts/AuthContext';

/**
 * Componente reutilizable para las opciones del perfil
 */
const ProfileOption = ({ 
  text, 
  onPress 
}: { 
  text: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
  </TouchableOpacity>
);

/**
 * Pantalla de Perfil - Vista del Cliente
 * Aquí el usuario podrá ver y editar su información personal
 */
const PerfilScreen = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario al montar el componente o cuando cambie el estado de autenticación
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !authUser) {
        setLoading(false);
        setError('No hay sesión activa');
        return;
      }

      console.log('🔵 Cargando datos del usuario...');
      try {
        const userData = await getCurrentUserInfo();
        console.log('🔵 Datos del usuario cargados:', userData);
        setUserInfo(userData);
        setError(null);
      } catch (err) {
        console.error('🔴 Error al cargar los datos del usuario:', err);
        setError('No se pudieron cargar los datos del perfil');
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Función para manejar el cierre de sesión
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
              console.log('✅ Sesión cerrada exitosamente');
            } catch (error) {
              console.error('🔴 Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  // Funciones para las opciones del perfil
  const handleEditProfile = () => {
    console.log('Navegando a editar perfil...');
    // TODO: Implementar navegación a la pantalla de edición de perfil
  };

  const handlePaymentMethods = () => {
    console.log('Navegando a métodos de pago...');
    // TODO: Implementar navegación a la pantalla de métodos de pago
  };

  const handleHelpSupport = () => {
    console.log('Navegando a ayuda y soporte...');
    // TODO: Implementar navegación a la pantalla de ayuda
  };

  const handleTermsConditions = () => {
    console.log('Navegando a términos y condiciones...');
    // TODO: Implementar navegación a la pantalla de términos
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // Mostrar pantalla de error
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

  // Obtener el nombre completo del usuario
  const fullName = userInfo?.apellido 
    ? `${userInfo.nombre} ${userInfo.apellido}` 
    : userInfo?.nombre || 'Usuario';

  return (
    <ScrollView style={styles.container}>
      {/* Cabecera del perfil */}
      <View style={styles.header}>
        <Image
          source={{ 
            uri: userInfo?.fotoUrl || 'https://placehold.co/100x100/3498db/FFFFFF/png?text=U' 
          }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.userEmail}>{userInfo?.email || 'email@ejemplo.com'}</Text>
      </View>

      {/* Sección de Cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CUENTA</Text>
        <View style={styles.sectionContent}>
          <ProfileOption
            text="Editar Perfil"
            onPress={handleEditProfile}
          />
          <View style={styles.divider} />
          <ProfileOption
            text="Métodos de Pago"
            onPress={handlePaymentMethods}
          />
        </View>
      </View>

      {/* Sección de Soporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOPORTE</Text>
        <View style={styles.sectionContent}>
          <ProfileOption
            text="Ayuda y Soporte"
            onPress={handleHelpSupport}
          />
          <View style={styles.divider} />
          <ProfileOption
            text="Términos y Condiciones"
            onPress={handleTermsConditions}
          />
        </View>
      </View>

      {/* Botón de Cerrar Sesión */}
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
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
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
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
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
    color: colors.text,
  },
  logoutButton: {
    margin: 24,
    backgroundColor: colors.error,
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

export default PerfilScreen;
