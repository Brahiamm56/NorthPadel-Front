import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../../config/firebase';
import { storage, STORAGE_KEYS } from '../../../utils/storage';
import {
  User,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from '../../../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Escuchar cambios de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔵 Estado de autenticación de Firebase cambió:', firebaseUser ? 'Autenticado' : 'No autenticado');
      try {
        if (firebaseUser) {
          // Obtener el token
          const token = await firebaseUser.getIdToken();
          // Guardar el token en AsyncStorage
          await AsyncStorage.setItem('auth_token', token);
          await handleUserAuthenticated(firebaseUser);
        } else {
          // Limpiar token y usuario de AsyncStorage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          setUser(null);
          setToken(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('🔴 Error manejando cambio de autenticación:', error);
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Escuchar eventos de login/logout desde authService
  useEffect(() => {
    const loginListener = DeviceEventEmitter.addListener('userLoggedIn', (data) => {
      console.log('🔵 Evento de login recibido, actualizando estado del AuthContext');
      console.log('🔵 Datos del login:', data);
      
      // Convertir los datos del backend al formato del AuthContext
      const user: User = {
        uid: data.user.id,
        email: data.user.email,
        nombre: data.user.nombre,
        apellido: data.user.apellido || '',  // Si no viene del backend, usamos string vacío
        role: data.user.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(user);
      setToken(data.token);
      setLoading(false);
    });

    const logoutListener = DeviceEventEmitter.addListener('userLoggedOut', () => {
      console.log('🔴 Evento de logout recibido, limpiando estado del AuthContext');
      setUser(null);
      setToken(null);
      setLoading(false);
    });

    return () => {
      loginListener.remove();
      logoutListener.remove();
    };
  }, []);

  // Cargar usuario guardado en AsyncStorage (usando las mismas claves que authService)
  const loadUserFromStorage = async () => {
    try {
      console.log('🔵 Cargando usuario desde AsyncStorage...');
      
      // Verificar si hay un usuario activo en Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('🔴 No hay usuario autenticado en Firebase');
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      // Usar las mismas claves que authService
      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUserJson = await AsyncStorage.getItem('user_data');
      
      console.log('🔵 Token encontrado:', !!savedToken);
      console.log('🔵 Usuario encontrado:', !!savedUserJson);
      
      if (savedUserJson && savedToken) {
        const savedUser = JSON.parse(savedUserJson);
        console.log('🔵 Usuario cargado desde storage:', savedUser);
        
        // Convertir al formato del AuthContext y asegurarse de que el uid coincida con Firebase
        const user: User = {
          uid: currentUser.uid, // Usar el uid de Firebase
          email: currentUser.email || savedUser.email,
          nombre: savedUser.nombre,
          apellido: savedUser.apellido || '',  // Si no viene del storage, usamos string vacío
          role: savedUser.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setUser(user);
        setToken(savedToken);
        console.log('✅ Usuario cargado exitosamente en AuthContext');
      } else {
        console.log('🔵 No hay usuario guardado');
      }
    } catch (error) {
      console.error('🔴 Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar usuario autenticado
  const handleUserAuthenticated = async (firebaseUser: FirebaseUser) => {
    try {
      // Obtener token de Firebase
      const idToken = await firebaseUser.getIdToken();

      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono,
          role: userData.role || 'user',
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };

        // Guardar en estado y AsyncStorage
        setUser(user);
        setToken(idToken);
        await storage.setItem(STORAGE_KEYS.USER, user);
        await storage.setItem(STORAGE_KEYS.TOKEN, idToken);
      }
    } catch (error) {
      console.error('Error handling authenticated user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      await handleUserAuthenticated(userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Crear documento de usuario en Firestore
      const newUser: Omit<User, 'uid'> = {
        email: credentials.email,
        nombre: credentials.nombre,
        apellido: credentials.apellido,
        telefono: credentials.telefono,
        role: 'user', // Por defecto es usuario
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      await handleUserAuthenticated(userCredential.user);
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      await storage.removeItem(STORAGE_KEYS.USER);
      await storage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Actualizar usuario
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData, updatedAt: new Date() };
      await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
      setUser(updatedUser);
      await storage.setItem(STORAGE_KEYS.USER, updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mensajes de error en español
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    default:
      return 'Error al autenticar. Intenta nuevamente';
  }
};