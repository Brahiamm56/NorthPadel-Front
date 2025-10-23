import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Importar las pantallas del usuario
import CanchasScreen from '../screens/user/CanchasScreen';
import CanchaDetalleScreen from '../screens/user/CanchaDetalleScreen';
import MisReservasScreen from '../screens/user/MisReservasScreen';
import PerfilScreen from '../screens/user/PerfilScreen';

/**
 * Definición de tipos para el Stack Navigator de Canchas
 */
export type CanchasStackParamList = {
  CanchasHome: undefined;
  CanchaDetalle: { canchaId: string; complejoId: string };
};

/**
 * Definición de tipos para las rutas del Tab Navigator del usuario
 */
type UserTabParamList = {
  CanchasTab: undefined;
  MisReservas: undefined;
  Perfil: undefined;
};

// Crear el Stack Navigator para Canchas
const CanchasStack = createNativeStackNavigator<CanchasStackParamList>();

/**
 * Stack Navigator para la sección de Canchas
 * Permite navegar entre la lista de canchas y el detalle
 */
const CanchasStackNavigator = () => {
  return (
    <CanchasStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: true,
      }}
    >
      <CanchasStack.Screen
        name="CanchasHome"
        component={CanchasScreen}
        options={{
          headerShown: false,
        }}
      />
      <CanchasStack.Screen
        name="CanchaDetalle"
        component={CanchaDetalleScreen}
        options={{
          title: 'Detalle de Cancha',
          headerBackTitle: 'Volver',
        }}
      />
    </CanchasStack.Navigator>
  );
};

// Crear el Bottom Tab Navigator
const Tab = createBottomTabNavigator<UserTabParamList>();

/**
 * UserTabNavigator
 * Navegación principal con pestañas para la sección del cliente
 * Permite al usuario navegar entre Canchas, Mis Reservas y Perfil
 */
export const UserTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Configuración de los íconos de las pestañas
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Seleccionar el ícono según la ruta
          if (route.name === 'CanchasTab') {
            iconName = 'tennisball-outline';
          } else if (route.name === 'MisReservas') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = 'person-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          // Retornar el ícono con el color apropiado
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Color del ícono y texto cuando la pestaña está activa
        tabBarActiveTintColor: colors.primary,
        // Color del ícono y texto cuando la pestaña está inactiva
        tabBarInactiveTintColor: colors.gray500,
        // Estilos de la barra de pestañas con SafeArea
        tabBarStyle: {
          paddingTop: 5,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
        },
        // Estilos del texto de las etiquetas
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
          fontWeight: '500',
        },
        // Ocultar el header (encabezado) por defecto
        headerShown: false,
      })}
    >
      {/* Pestaña de Canchas */}
      <Tab.Screen 
        name="CanchasTab" 
        component={CanchasStackNavigator}
        options={{
          tabBarLabel: 'Canchas',
        }}
      />

      {/* Pestaña de Mis Reservas */}
      <Tab.Screen 
        name="MisReservas" 
        component={MisReservasScreen}
        options={{
          tabBarLabel: 'Mis Reservas',
        }}
      />

      {/* Pestaña de Perfil */}
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;
