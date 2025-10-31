import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { AdminCanchasScreen } from '../features/admin/screens/AdminCanchasScreen';
import AdminReservasScreen from '../features/admin/screens/AdminReservasScreen';
import AdminPerfilScreen from '../features/admin/screens/AdminPerfilScreen';

type TabParamList = {
  Reservas: undefined;
  Canchas: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const AdminTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          paddingTop: 5,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Reservas"
        component={AdminReservasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Canchas" 
        component={AdminCanchasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="tennisball" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={AdminPerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            console.log('Navegando a la pantalla de Perfil');
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;