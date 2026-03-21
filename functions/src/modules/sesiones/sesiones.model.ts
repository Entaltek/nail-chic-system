import { Timestamp } from 'firebase-admin/firestore';

export interface SesionAdicional {
  id: string;
  nombre: string;
  tipo: 'tecnica' | 'aplicacion';
  precio_base: number;
  tiempo_extra_min: number;
}

export interface Sesion {
  id: string;
  servicio_id: string;
  servicio_nombre: string;
  servicio_precio: number;
  trabajador_id: string;
  trabajador_nombre: string;
  cliente_id: string | null;
  adicionales: SesionAdicional[];
  precio_adicionales: number;
  precio_estimado: number;
  precio_cobrado: number | null;
  tiempo_estimado_min: number;
  duracion_real_min: number | null;
  inicio: Timestamp;
  fin: Timestamp | null;
  estado: 'en_curso' | 'finalizado';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IniciarSesionPayload {
  servicio_id: string;
  trabajador_id?: string;
  cliente_id?: string | null;
  adicionales_ids?: string[];
}
