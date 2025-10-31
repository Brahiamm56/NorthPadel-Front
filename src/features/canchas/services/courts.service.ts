// --- ¡IMPORTANTE! ---
// Usamos la dirección IP que nos proporcionaste.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_KEY } from '../../../config/api';

const API_URL = API_BASE_URL;

/**
 * Tipos de datos que esperamos recibir de la API.
 * Deben coincidir con la estructura de tu base de datos en Firestore.
 */
export type Cancha = {
  id: string;
  nombre: string;
  imagenUrl: string;
  precioHora: string;
  techada?: boolean;
  iluminacion?: boolean;
  blindex?: boolean;
  cesped?: boolean;
  horariosDisponibles?: number;
  caracteristicas?: string[];
};export type Complejo = {
 id: string;
 nombre: string;
 canchas: Cancha[];
 isVerified?: boolean;
 telefono?: string;
 distancia?: number;
 rating?: number;
 reviewsCount?: number;
 direccion?: string;
};

export type CanchaDetalle = {
  id: string;
  nombre: string;
  complejoNombre: string;
  precioHora: string;
  imagenes?: string[];
  imagenUrl?: string;
  descripcion: string;
  caracteristicas: string[];
  esTechada?: boolean;
  vendePelotitas?: boolean;
  // Horarios de operación
  horaInicio?: string;  // Ej: "08:00"
  horaFin?: string;     // Ej: "23:00"
  // El backend puede devolver los horarios en diferentes formatos
  horariosDisponibles?: string[];  // Array de horarios libres
  horariosMaestros?: string[];     // Array de todos los horarios de la cancha
  horariosOcupados?: string[];     // Array de horarios ya reservados
  horariosReservados?: string[];   // Array de horarios con reservas confirmadas
  horariosBloqueados?: string[];   // Array de horarios bloqueados por admin
  bloqueos?: Array<{fecha: string, hora: string}>;  // Array de bloqueos con fecha
};


/**
 * Obtiene la lista de complejos con sus canchas desde el backend.
 */
export const getComplejosConCanchas = async (): Promise<Complejo[]> => {
 try {
 const token = await AsyncStorage.getItem(TOKEN_KEY);
 const response = await fetch(`${API_URL}/canchas`, {
 headers: {
 'Authorization': `Bearer ${token}`,
 },
 });
 if (!response.ok) {
 throw new Error('La respuesta de la red no fue exitosa');
 }
 const data = await response.json();
 return data;
 } catch (error) {
 console.error("Hubo un problema al obtener los complejos:", error);
 return [];
 }
 };

/**
 * Obtiene el detalle de una cancha específica desde el backend.
 */
export const getCanchaDetalle = async (complejoId: string, canchaId: string, selectedDate?: string): Promise<CanchaDetalle | null> => {
     try {
         const token = await AsyncStorage.getItem(TOKEN_KEY);
         const url = selectedDate
           ? `${API_URL}/canchas/${complejoId}/${canchaId}?fecha=${selectedDate}`
           : `${API_URL}/canchas/${complejoId}/${canchaId}`;
         
         console.log('🔗 getCanchaDetalle - URL:', url);
         console.log('🔑 Token presente:', !!token);
         
         const response = await fetch(url, {
           headers: {
             'Authorization': `Bearer ${token}`,
           },
         });
         
         console.log('📡 Response status:', response.status);
         
         if (!response.ok) {
             const errorText = await response.text();
             console.error('❌ Response not OK:', errorText);
             throw new Error('No se encontró la cancha');
         }
         const data = await response.json();
         console.log('✅ Datos recibidos en servicio:', JSON.stringify(data, null, 2));
         return data;
     } catch (error) {
         console.error(`❌ Hubo un problema al obtener el detalle de la cancha ${canchaId}:`, error);
         return null;
     }
 }
