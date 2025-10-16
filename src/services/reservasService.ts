// Reemplaza 'TU_DIRECCION_IP' con la IP de tu computadora
const API_URL = 'http://192.168.100.2:3000/api';

export interface ReservaPayload {
  complejoId: string;
  canchaId: string;
  fecha: string; // ej: "2025-10-16"
  hora: string;  // ej: "19:00"
  usuarioId: string;
}

/**
 * Llama al backend para crear una nueva reserva.
 */
export const crearReserva = async (reservaData: ReservaPayload) => {
  try {
    const response = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservaData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${errorData}`);
    }

    const data = await response.json();
    console.log('Reserva creada exitosamente:', data);
    return data;

  } catch (error) {
    console.error("Hubo un problema al crear la reserva:", error);
    return null;
  }
};

/**
 * Llama al backend para obtener las reservas del usuario.
 * El 'tipo' puede ser 'proximas' o 'anteriores'.
 * NOTA: La lógica de filtrado por tipo aún debe implementarse en el backend.
 */
export const getMisReservas = async (tipo: 'proximas' | 'anteriores') => {
  try {
    // Por ahora, obtenemos todas las reservas. Más adelante, el backend
    // podrá filtrar por tipo: /api/reservas?tipo=proximas
    const response = await fetch(`${API_URL}/reservas`);
    if (!response.ok) {
      throw new Error('No se pudieron obtener las reservas.');
    }
    const data = await response.json();
    
    // Aquí podríamos filtrar en el frontend por ahora, pero lo ideal
    // es que el backend lo haga en el futuro.
    console.log(`Reservas cargadas desde el backend para ${tipo}:`, data);
    return data;
    
  } catch (error) {
    console.error("Hubo un problema al obtener las reservas:", error);
    return [];
  }
};
