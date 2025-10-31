import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { Loading } from '../components/common';
import { AdminTabs } from './AdminTabs';
import { UserTabNavigator } from './UserTabNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Agregar logs para depuración
  useEffect(() => {
    console.log('Estado de autenticación:', {
      isAuthenticated,
      userRole: user?.role,
      loading,
      user
    });
  }, [isAuthenticated, user, loading]);

  if (loading) {
    return <Loading text="Cargando..." />;
  }

  // Si no está autenticado, mostrar el AuthNavigator
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Si está autenticado, verificar el rol
  if (user) {
    // Limpiar el rol de espacios y convertir a minúsculas para la comparación
    const userRole = user.role?.toString().trim().toLowerCase();
    console.log('Rol del usuario (limpio):', userRole);
    
    // Mostrar navegador según el rol del usuario
    if (userRole === 'admin') {
      console.log('✅ Redirigiendo a AdminTabs');
      return (
        <NavigationContainer>
          <AdminTabs />
        </NavigationContainer>
      );
    } else if (userRole === 'user' || userRole === 'usuario') {
      console.log('✅ Redirigiendo a UserTabNavigator');
      return (
        <NavigationContainer>
          <UserTabNavigator />
        </NavigationContainer>
      );
    }
  }

  // Si está autenticado pero no tiene un rol válido, mostrar mensaje de error
  console.warn('⚠️ Usuario autenticado con rol desconocido:', user);
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
};