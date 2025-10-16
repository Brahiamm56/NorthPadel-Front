/**
 * Servicio para manejar las reservas del usuario
 * Este archivo será el único que necesitará modificaciones al conectar con el backend real
 */

export type Reserva = {
  id: string;
  fecha: string;
  hora: string;
  canchaNombre: string;
  complejoNombre: string;
  estado: 'Confirmada' | 'Pagada' | 'Completada' | 'Cancelada';
};

// Datos de ejemplo para próximas reservas (vacío para mostrar empty state)
const proximasReservasMock: Reserva[] = [];

// Datos de ejemplo para reservas anteriores (vacío para mostrar empty state)
const reservasAnterioresMock: Reserva[] = [];

/**
 * Obtiene las próximas reservas del usuario
 */
export const getProximasReservas = async (): Promise<Reserva[]> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...proximasReservasMock];
};

/**
 * Obtiene las reservas anteriores del usuario
 */
export const getReservasAnteriores = async (): Promise<Reserva[]> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...reservasAnterioresMock];
};

/**
 * Cancela una reserva específica
 */
export const cancelarReserva = async (reservaId: string): Promise<void> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Reserva cancelada:', reservaId);
  // En producción, aquí se haría la llamada a la API
};
