import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definir los temas
const lightTheme = {
  mode: 'light',
  colors: {
    // Colores principales
    primary: '#001F5B',        // Azul marino
    secondary: '#C4D600',      // Verde lima
    
    // Fondos
    background: '#F5F5F5',     // Fondo general
    surface: '#FFFFFF',        // Cards, modales
    
    // Textos
    text: '#001F5B',           // Texto principal
    textSecondary: '#666666',  // Texto secundario
    textTertiary: '#999999',   // Texto terciario
    
    // Bordes y divisores
    border: '#E0E0E0',
    divider: '#F0F0F0',
    
    // Estados
    success: '#4CAF50',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#2196F3',
    
    // Elementos de UI
    inputBackground: '#FFFFFF',
    inputBorder: '#E0E0E0',
    placeholder: '#999999',
    
    // Navegación
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#C4D600',
    tabBarInactive: '#999999',
    
    // Sombras
    shadow: '#000000',
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    // Colores principales (ajustados para dark mode)
    primary: '#4A90E2',        // Azul más claro
    secondary: '#D4E157',      // Verde lima más brillante
    
    // Fondos
    background: '#121212',     // Fondo general oscuro
    surface: '#1E1E1E',        // Cards, modales
    
    // Textos
    text: '#FFFFFF',           // Texto principal blanco
    textSecondary: '#B0B0B0',  // Texto secundario
    textTertiary: '#808080',   // Texto terciario
    
    // Bordes y divisores
    border: '#333333',
    divider: '#2A2A2A',
    
    // Estados (mantener similares)
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    
    // Elementos de UI
    inputBackground: '#2A2A2A',
    inputBorder: '#404040',
    placeholder: '#808080',
    
    // Navegación
    tabBarBackground: '#1E1E1E',
    tabBarActive: '#D4E157',
    tabBarInactive: '#808080',
    
    // Sombras (reducidas en dark mode)
    shadow: '#000000',
  },
};

// Definir el tipo del contexto
type ThemeContextType = {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
};

// Crear el Context con el tipo
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};