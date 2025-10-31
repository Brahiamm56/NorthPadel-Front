import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { StatusBarManager } from './src/components/common/StatusBarManager';

// Mantener el splash screen visible mientras se carga la app
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aquí puedes cargar fuentes o hacer llamadas iniciales
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular carga
      } catch (e) {
        console.warn(e);
      } finally {
        // Decirle a la aplicación que renderice
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Esto le dice al splash screen que se oculte
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <StatusBarManager />
            <AppNavigator />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}