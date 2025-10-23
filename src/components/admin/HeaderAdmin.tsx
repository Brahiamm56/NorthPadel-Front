import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

interface HeaderAdminProps {
  titulo: string;
  mostrarNotificaciones?: boolean;
}

export const HeaderAdmin: React.FC<HeaderAdminProps> = ({
  titulo,
  mostrarNotificaciones = true
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.titulo}>{titulo}</Text>

        {mostrarNotificaciones && (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: spacing.xs,
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.white,
  },
  notificationButton: {
    padding: spacing.xs,
  },
});