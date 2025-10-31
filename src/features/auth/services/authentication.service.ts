import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { API_BASE_URL, TOKEN_KEY } from '../../../config/api';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../config/firebase';

// --- URL de nuestro backend ---
const API_URL = `${API_BASE_URL}/auth`;
const USER_KEY = 'user_data';

// --- Tipos de Datos ---
export type Usuario = {
  id: string; // Usaremos el ID de nuestro backend
  email: string;
  nombre?: string;
  role: 'admin' | 'user';
};

// --- FUNCIONES QUE HABLAN CON EL BACKEND ---

/**
 * Registra un nuevo usuario llamando a nuestro backend.
 */
export const registerUser = async (userData: any) => {
  try {
    console.log('🔵 Enviando datos de registro a:', `${API_URL}/register`);
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    console.log('🔵 Respuesta del servidor:', response.status, response.statusText);
    
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('🔴 Respuesta no es JSON:', textResponse);
      throw new Error(`El servidor devolvió: ${textResponse}`);
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar el usuario.');
    }

    // Crear usuario en Firebase después del registro exitoso en el backend
    try {
      await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      console.log('✅ Usuario creado en Firebase');
    } catch (firebaseError) {
      console.error('🔴 Error al crear usuario en Firebase:', firebaseError);
      // Continuamos aunque falle Firebase ya que tenemos el usuario en el backend
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("🔴 Error en registerUser:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Inicia sesión de un usuario y guarda el token y los datos del usuario.
 */
export const loginUser = async (credentials: any) => {
    try {
        console.log('🔵 Enviando credenciales a:', `${API_URL}/login`);
        console.log('🔵 Credenciales:', { email: credentials.email, password: '***' });
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        
        console.log('🔵 Respuesta del servidor:', response.status, response.statusText);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        console.log('🔵 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            // Si no es JSON, obtener el texto de la respuesta
            const textResponse = await response.text();
            console.error('🔴 Respuesta no es JSON:', textResponse);
            throw new Error(`El servidor devolvió: ${textResponse}`);
        }
        
        const data = await response.json();
        console.log('🔵 Datos recibidos:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión.');
        }

        // --- ¡Paso Clave! Guardamos los datos de la sesión ---
        if (data.token && data.user) {
            // Primero autenticamos en Firebase
            try {
                await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
                console.log('✅ Usuario autenticado en Firebase');
            } catch (firebaseError) {
                console.error('🔴 Error al autenticar en Firebase:', firebaseError);
                // Continuamos aunque falle Firebase ya que tenemos el token JWT
            }

            await AsyncStorage.setItem(TOKEN_KEY, data.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
            console.log('✅ Token y datos de usuario guardados');
            
            // Notificar al AuthContext que el usuario se logueó
            DeviceEventEmitter.emit('userLoggedIn', {
                user: data.user,
                token: data.token
            });
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("🔴 Error en loginUser:", error);
        return { success: false, message: error.message };
    }
};

/**
 * Cierra la sesión del usuario eliminando el token y los datos.
 * Esta función limpia tanto el backend como el estado local.
 */
export const logout = async (): Promise<void> => {
  try {
    // 1. Obtener el token actual
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    // 2. Si hay token, notificar al backend que se cierra sesión
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        console.log('Sesión cerrada en el backend exitosamente');
      } catch (backendError) {
        console.warn('No se pudo cerrar sesión en el backend:', backendError);
        // Continuamos aunque falle el backend
      }
    }
    
    // 3. Limpiar datos locales
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    console.log('Sesión local cerrada exitosamente');
    
    // 4. Disparar evento para notificar a los componentes que necesiten reaccionar al logout
    DeviceEventEmitter.emit('userLoggedOut');
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

// --- FUNCIONES PARA GESTIONAR LA SESIÓN GUARDADA ---

/**
 * Obtiene el token guardado en el dispositivo.
 */
export const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

/**
 * Obtiene los datos del usuario guardados en el dispositivo.
 */
export const getSavedUser = async (): Promise<Usuario | null> => {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
};
