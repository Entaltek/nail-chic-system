export type NivelDiseno = 'basico' | 'intermedio' | 'avanzado' | 'experto';

export interface Diseno {
  id: string;
  foto_url: string;
  thumb_url: string;
  foto_path: string;
  thumb_path: string;
  nivel: NivelDiseno;
  tiempo_real_min: number | null;
  precio_cobrado: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NivelCounter {
  count: number;
  precio_promedio: number | null;
}

export interface DisenoCounters {
  basico: NivelCounter;
  intermedio: NivelCounter;
  avanzado: NivelCounter;
  experto: NivelCounter;
}

export interface DisenoListResponse {
  items: Diseno[];
  total: number;
  nextCursor: string | null;
  counters: DisenoCounters;
}
