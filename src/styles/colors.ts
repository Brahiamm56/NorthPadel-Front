export const colors = {
  // Colores principales
  primary: '#10b981', // Verde (canchas de pádel)
  primaryDark: '#059669',
  primaryLight: '#34d399',
  
  // Colores de marca NorthPadel
  brandBlue: '#001F5B', // Azul marino del logo
  brandGreen: '#C4D600', // Verde lima del logo
  
  // Colores secundarios
  secondary: '#3b82f6',
  secondaryDark: '#2563eb',
  secondaryLight: '#60a5fa',
  
  // Colores de estado
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Grises
  black: '#000000',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  
  // Textos
  text: '#111827',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  
  // Bordes
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Otros
  shadow: '#00000015',
  overlay: '#00000080',
};

export type ColorKey = keyof typeof colors;