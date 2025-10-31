/**
 * Servicio para manejar la información del club
 * Este archivo será el único que necesitará modificaciones al conectar con el backend real
 */

type ClubInfo = {
  id: string;
  nombre: string;
  logoUrl: string;
  direccion?: string;
  telefono?: string;
  horario?: string;
};

// Datos de ejemplo para simular la respuesta de una API
const clubInfoEjemplo: ClubInfo = {
  id: 'club-123',
  nombre: 'North Padel Club',
  logoUrl: 'https://via.placeholder.com/150',
  direccion: 'Av. Ejemplo 1234, CABA',
  telefono: '+54 11 1234-5678',
  horario: 'Lunes a Domingo: 8:00 - 23:00',
};

/**
 * Obtiene la información del club
 */
export const getClubInfo = async (): Promise<ClubInfo> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...clubInfoEjemplo };
};

/**
 * Actualiza el logo del club
 * @param imageUri URI de la imagen seleccionada
 */
export const updateClubLogo = async (imageUri: string): Promise<ClubInfo> => {
  // Simular retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // En un entorno real, aquí se enviaría la imagen al servidor
  // Por ahora, solo actualizamos el objeto local
  clubInfoEjemplo.logoUrl = imageUri;
  
  return { ...clubInfoEjemplo };
};

export type { ClubInfo };
