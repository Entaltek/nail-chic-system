import { Timestamp } from 'firebase-admin/firestore';
import { NivelDiseno } from './diseno.types';

export interface Ingrediente {
  producto_id: string;
  cantidad:    number;
}

export interface Diseno {
  id:              string;
  foto_url:        string;    // imagen full — vista detalle
  thumb_url:       string;    // thumbnail 400x400 — grid de cards
  foto_path:       string;    // path interno full (para eliminar storage)
  thumb_path:      string;    // path interno thumb (para eliminar storage)
  nivel:           NivelDiseno;
  tiempo_real_min: number | null;
  precio_cobrado:  number | null;
  tags:            string[];
  ingredientes:    Ingrediente[];
  createdAt:       Timestamp;
  updatedAt:       Timestamp;
}

export interface DisenoCreatePayload {
  nivel:            NivelDiseno;
  tiempo_real_min?: number;
  precio_cobrado?:  number;
  tags?:            string;  // llega como "frances,degradado"
  ingredientes?:    Ingrediente[];
}

export interface DisenoUpdatePayload {
  nivel?:           NivelDiseno;
  tiempo_real_min?: number;
  precio_cobrado?:  number;
  tags?:            string;
  ingredientes?:    Ingrediente[];
}
