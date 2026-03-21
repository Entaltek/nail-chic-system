import { Timestamp } from 'firebase-admin/firestore';

export interface Ingrediente {
  producto_id: string;
  cantidad:    number;
}

export interface Adicional {
  id:               string;
  nombre:           string;
  tipo:             'tecnica' | 'aplicacion';
  precio_base:      number;
  tiempo_extra_min: number;
  descripcion:      string | null;
  ingredientes:     Ingrediente[];
  createdAt:        Timestamp;
  updatedAt:        Timestamp;
}

export interface AdicionalCreatePayload {
  nombre:           string;
  tipo:             'tecnica' | 'aplicacion';
  precio_base:      number;
  tiempo_extra_min: number;
  descripcion?:     string | null;
  ingredientes?:    Ingrediente[];
}

export interface AdicionalUpdatePayload {
  nombre?:           string;
  tipo?:             'tecnica' | 'aplicacion';
  precio_base?:      number;
  tiempo_extra_min?: number;
  descripcion?:      string | null;
  ingredientes?:     Ingrediente[];
}
