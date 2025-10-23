import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_KEY } from '../config/api';

const API_URL = API_BASE_URL;

/**
 * Tipos para el servicio de admin
 */
export interface CanchaAdmin {
  id: string;
  nombre: string;
  precioHora: number;
  descripcion: string;
  techada: boolean;
  pelotitas: boolean;
  horaInicio?: string;
  horaFin?: string;
  imagenUrl: string;
  activa: boolean;
}

export interface ReservaAdmin {
  id: string;
  fecha: string;
  hora: string;
  canchaNombre: string;
  canchaImagenUrl: string;
  usuarioNombre: string;
  usuarioEmail: string;
  estado: string;
}

/**
 * Obtiene las canchas del admin autenticado
 */
export const getMisCanchasAdmin = async (): Promise<CanchaAdmin[]> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('🔑 Token:', token ? 'Presente' : 'NO EXISTE');
    console.log('🌐 URL:', `${API_URL}/admin/canchas`);
    
    const response = await fetch(`${API_URL}/admin/canchas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Status del response:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error('Error al obtener canchas del admin');
    }

    const data = await response.json();
    console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('💥 Error en getMisCanchasAdmin:', error);
    return [];
  }
};

/**
 * Crea una nueva cancha para el admin
 */
export const crearCanchaAdmin = async (canchaData: Omit<CanchaAdmin, 'id'>): Promise<CanchaAdmin | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(canchaData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en crearCanchaAdmin:', error);
    return null;
  }
};

/**
 * Actualiza una cancha del admin
 */
export const updateCanchaAdmin = async (canchaId: string, canchaData: Partial<CanchaAdmin>): Promise<CanchaAdmin | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas/${canchaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(canchaData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateCanchaAdmin:', error);
    return null;
  }
};

/**
 * Elimina una cancha del admin
 */
export const deleteCanchaAdmin = async (canchaId: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas/${canchaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en deleteCanchaAdmin:', error);
    return false;
  }
};

/**
 * Toggle del estado activa/inactiva de una cancha
 */
export const toggleCanchaStatus = async (canchaId: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas/${canchaId}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en toggleCanchaStatus:', error);
    return false;
  }
};

/**
 * Obtiene las reservas del admin
 */
export const getAdminReservas = async (): Promise<ReservaAdmin[]> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/reservas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener reservas del admin');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAdminReservas:', error);
    return [];
  }
};

/**
 * Confirma una reserva
 */
export const confirmarReservaAdmin = async (reservaId: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/reservas/${reservaId}/confirmar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en confirmarReservaAdmin:', error);
    return false;
  }
};

/**
 * Cancela una reserva
 */
export const cancelarReservaAdmin = async (reservaId: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/reservas/${reservaId}/cancelar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en cancelarReservaAdmin:', error);
    return false;
  }
};

/**
 * Obtiene la disponibilidad de una cancha para una fecha específica
 */
export const getCanchaDisponibilidad = async (
  canchaId: string,
  fecha: string
): Promise<{ horariosReservados: string[]; horariosBloqueados: string[] }> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(
      `${API_URL}/admin/canchas/${canchaId}/disponibilidad?fecha=${fecha}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    const data = await response.json();
    return {
      horariosReservados: data.horariosReservados || [],
      horariosBloqueados: data.horariosBloqueados || [],
    };
  } catch (error) {
    console.error('Error en getCanchaDisponibilidad:', error);
    throw error;
  }
};

/**
 * Bloquea un horario para una cancha
 */
export const bloquearHorarioAdmin = async (canchaId: string, fecha: string, hora: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas/${canchaId}/bloquear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fecha, hora }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en bloquearHorarioAdmin:', error);
    return false;
  }
};

/**
 * Desbloquea un horario para una cancha
 */
export const desbloquearHorarioAdmin = async (canchaId: string, fecha: string, hora: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/admin/canchas/${canchaId}/desbloquear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fecha, hora }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    return true;
  } catch (error) {
    console.error('Error en desbloquearHorarioAdmin:', error);
    return false;
  }
};