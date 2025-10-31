import axios from 'axios';
import { API_URL } from '../config/api';
import { API_BASE_URL, TOKEN_KEY } from '../../../config/api';

export const getReservasAdmin = async (token: string): Promise<ReservaAdmin[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/reservas`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error('Error al obtener reservas');
  }
};

export const cancelarReservaAdmin = async (
  reservaId: string,
  token: string
): Promise<void> => {
  try {
    await axios.patch(
      `${API_URL}/api/admin/reservas/${reservaId}/cancelar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch (error) {
    throw new Error('Error al cancelar reserva');
  }
};