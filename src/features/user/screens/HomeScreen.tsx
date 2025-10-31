import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize, fontWeight } from '../../theme/spacing';

export const HomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Usuario</Text>
      <Text style={styles.subtitle}>
        Bienvenido, {user?.nombre} {user?.apellido}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🎾 Aquí verás las canchas disponibles</Text>
        <Text style={styles.infoText}>📅 Podrás hacer reservas</Text>
        <Text style={styles.infoText}>📋 Ver tus reservas</Text>
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