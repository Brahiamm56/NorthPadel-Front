import { auth } from '../../../config/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio para manejar la información del usuario cliente
 */

type UserInfo = {
  uid: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  fotoUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/**
 * Obtiene la información del usuario actual desde Firebase Auth y Firestore
 */
export const getCurrentUserInfo = async (): Promise<UserInfo> => {
  try {
    // Verificar token de autenticación
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      console.log('🔴 No se encontró token de autenticación');
      throw new Error('No hay usuario autenticado');
    }

    const user = auth.currentUser;
    
    if (!user) {
      console.log('🔴 No hay usuario activo en Firebase');
      throw new Error('No hay usuario autenticado');
    }

    console.log('✅ Usuario autenticado encontrado:', user.email);

    // Obtener datos adicionales del usuario desde Firestore
    const db = getFirestore();
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('No se encontraron datos adicionales en Firestore para el usuario:', user.uid);
      return {
        uid: user.uid,
        nombre: user.displayName || 'Usuario',
        email: user.email || '',
        fotoUrl: user.photoURL || 'https://placehold.co/100x100/3498db/FFFFFF/png?text=U',
      };
    }

    const userData = userDoc.data();
    console.log('Datos del usuario desde Firestore:', userData);
    
    return {
      uid: user.uid,
      email: user.email || '',
      fotoUrl: userData.fotoUrl || user.photoURL || 'https://placehold.co/100x100/3498db/FFFFFF/png?text=U',
      ...userData,
    } as UserInfo;
  } catch (error) {
    console.error('Error en getCurrentUserInfo:', error);
    throw error;
  }
};

export type { UserInfo };
