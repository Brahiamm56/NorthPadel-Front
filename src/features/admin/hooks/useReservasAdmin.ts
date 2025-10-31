import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { getReservasAdmin, cancelarReservaAdmin } from '../services/reservaService';
import { ReservaAdmin, CanchaUnica } from '../types/reservas.types';

export const useReservasAdmin = () => {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCancha, setSelectedCancha] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmadas' | 'canceladas'>('todas');
  const [busqueda, setBusqueda] = useState('');

  // Cargar reservas
  const cargarReservas = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await getReservasAdmin(token);
      setReservas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (reservaId: string) => {
    if (!token) return;

    try {
      await cancelarReservaAdmin(reservaId, token);
      // Actualizar UI optimísticamente
      setReservas(prev =>
        prev.map(r =>
          r.id === reservaId ? { ...r, estado: 'Cancelada' } : r
        )
      );
      Alert.alert('Éxito', 'Reserva cancelada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la reserva');
    }
  };

  // Filtros
  const reservasFiltradas = useMemo(() => {
    if (!reservas || !reservas.length) return [];

    let resultado = reservas;

    // Filtrar por fecha
    resultado = resultado.filter(r =>
      format(parseISO(r.fecha), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );

    // Filtrar por cancha
    if (selectedCancha) {
      resultado = resultado.filter(r => r.canchaId === selectedCancha);
    }

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      const estadoBuscado = filtroEstado === 'confirmadas' ? 'Confirmada' : 'Cancelada';
      resultado = resultado.filter(r => r.estado === estadoBuscado);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(r =>
        r.usuarioNombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return resultado;
  }, [reservas, selectedDate, selectedCancha, filtroEstado, busqueda]);

  // Obtener canchas únicas
  const canchasUnicas = useMemo(() => {
    if (!reservas || !reservas.length) return [];

    const map = new Map();
    reservas.forEach(r => {
      if (!map.has(r.canchaId)) {
        map.set(r.canchaId, {
          id: r.canchaId,
          nombre: r.canchaNombre,
          imagen: r.canchaImagen
        });
      }
    });
    return Array.from(map.values());
  }, [reservas]);

  // Generar fechas para calendario
  const fechasCalendario = useMemo(() => {
    const fechas = [];
    for (let i = -7; i <= 7; i++) {
      fechas.push(addDays(new Date(), i));
    }
    return fechas;
  }, []);

  // Contar reservas por fecha
  const reservasPorFecha = useMemo(() => {
    if (!reservas || !reservas.length) return {};

    const conteo: { [key: string]: number } = {};
    reservas.forEach(r => {
      const fecha = format(parseISO(r.fecha), 'yyyy-MM-dd');
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });
    return conteo;
  }, [reservas]);

  useEffect(() => {
    cargarReservas();
  }, [token]);

  return {
    reservas: reservasFiltradas,
    loading,
    selectedDate,
    setSelectedDate,
    selectedCancha,
    setSelectedCancha,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    cancelarReserva,
    refrescar: cargarReservas,
    canchasUnicas,
    fechasCalendario,
    reservasPorFecha,
  };
};