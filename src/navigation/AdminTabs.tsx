import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AdminCanchasScreen } from '../screens/admin/AdminCanchasScreen';
import AdminReservasScreen from '../screens/admin/AdminReservasScreen';
import AdminPerfilScreen from '../screens/admin/AdminPerfilScreen';

type TabParamList = {
  Reservas: undefined;
  Canchas: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
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