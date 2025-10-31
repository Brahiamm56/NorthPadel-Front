import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (texto: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.busquedaContainer}>
      <View style={styles.busquedaInputContainer}>
        <Ionicons name="search-outline" size={20} color="#999999" style={styles.busquedaIcon} />
        <TextInput
          style={styles.busquedaInput}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          selectionColor={colors.brandBlue}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText('')}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  busquedaContainer: {
    marginTop: 12,
  },
  busquedaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    height: 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  busquedaIcon: {
    marginRight: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 15,
    color: colors.brandBlue,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    height: '100%',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});