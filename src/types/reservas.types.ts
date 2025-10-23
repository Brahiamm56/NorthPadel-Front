import { Timestamp } from 'firebase/firestore';

export type EstadoReserva = 'Confirmada' | 'Cancelada' | 'Pendiente';

export interface ReservaAdmin {
  id: string;
  complejoId: string;
  canchaId: string;
  canchaNombre: string;
  canchaImagen: string;
  fecha: string; // "2025-10-21"
  hora: string; // "21:00"
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioTelefono: string;
  estado: EstadoReserva;
  fechaCreacion: Timestamp;
}

export interface ReservaConCancha {
  id: string;
  complejoId: string;
  canchaId: string;
  canchaNombre: string;
  canchaImagenUrl?: string;
  fecha: string; // "2025-10-21"
  hora: string; // "21:00"
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  estado: EstadoReserva;
  createdAt: Timestamp | { _seconds: number; _nanoseconds: number };
  updatedAt: Timestamp | { _seconds: number; _nanoseconds: number };
  confirmedAt?: Timestamp | { _seconds: number; _nanoseconds: number };
  confirmedBy?: string;
  canceledAt?: Timestamp | { _seconds: number; _nanoseconds: number };
  canceledBy?: string;
  motivo?: string;
}

export interface CanchaUnica {
  id: string;
  nombre: string;
  imagen: string;
}