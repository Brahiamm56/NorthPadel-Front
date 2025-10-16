// --- ¡IMPORTANTE! ---
// Usamos la dirección IP que nos proporcionaste.
const API_URL = 'http://192.168.100.2:3000/api';

/**
 * Tipos de datos que esperamos recibir de la API.
 * Deben coincidir con la estructura de tu base de datos en Firestore.
 */
export type Cancha = {
  id: string;
  nombre: string;
  imagenUrl: string;
  precioHora: string;
};

export type Complejo = {
  id: string;
  nombre: string;
  canchas: Cancha[];
};

export type CanchaDetalle = {
  id: string;
  nombre: string;
  complejoNombre: string;
  precioHora: string;
  imagenes: string[];
  descripcion: string;
  caracteristicas: string[];
  horariosDisponibles: string[];
};


/**
 * Obtiene la lista de complejos con sus canchas desde el backend.
 */
export const getComplejosConCanchas = async (): Promise<Complejo[]> => {
  try {
    const response = await fetch(`${API_URL}/canchas`);
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
export const getCanchaDetalle = async (complejoId: string, canchaId: string): Promise<CanchaDetalle | null> => {
    try {
        const response = await fetch(`${API_URL}/canchas/${complejoId}/${canchaId}`);
        if (!response.ok) {
            throw new Error('No se encontró la cancha');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Hubo un problema al obtener el detalle de la cancha ${canchaId}:`, error);
        return null;
    }
}
