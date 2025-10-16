import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize, fontWeight } from '../../theme/spacing';

export const DashboardScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>
      <Text style={styles.subtitle}>
        Bienvenido, {user?.nombre} {user?.apellido}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>👑 ROL: ADMINISTRADOR</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🎾 Podrás gestionar tus canchas</Text>
        <Text style={styles.infoText}>📊 Ver estadísticas</Text>
        <Text style={styles.infoText}>📅 Administrar reservas</Text>
        <Text style={styles.infoText}>💰 Configurar precios</Text>
      </View>

      <Button
        title="Cerrar Sesión"
        onPress={logout}
        variant="outline"
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  infoBox: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});