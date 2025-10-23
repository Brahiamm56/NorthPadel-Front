import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';
import { CanchaUnica } from '../../types/reservas.types';

interface CanchasTabsProps {
  canchas: CanchaUnica[];
  selectedCancha: string | null;
  onSelectCancha: (canchaId: string | null) => void;
  reservasPorCancha: { [key: string]: number };
}

export const CanchasTabs: React.FC<CanchasTabsProps> = ({
  canchas,
  selectedCancha,
  onSelectCancha,
  reservasPorCancha,
}) => {
  const tabs = [
    { id: null, nombre: 'Todas', imagen: '' },
    ...canchas,
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isSelected = selectedCancha === tab.id;
          const count = tab.id ? reservasPorCancha[tab.id] || 0 : Object.values(reservasPorCancha).reduce((a, b) => a + b, 0);

          return (
            <TouchableOpacity
              key={tab.id || 'todas'}
              style={[
                styles.tab,
                isSelected && styles.tabSeleccionado,
              ]}
              onPress={() => onSelectCancha(tab.id)}
            >
              <Text
                style={[
                  styles.tabTexto,
                  isSelected && styles.tabTextoSeleccionado,
                ]}
              >
                {tab.nombre} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    minWidth: 80,
    alignItems: 'center',
  },
  tabSeleccionado: {
    backgroundColor: colors.primary,
  },
  tabTexto: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray600,
  },
  tabTextoSeleccionado: {
    color: colors.white,
  },
});