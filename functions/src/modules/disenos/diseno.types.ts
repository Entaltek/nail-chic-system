export type NivelDiseno = 'basico' | 'intermedio' | 'avanzado' | 'experto';

export const NIVELES_DISENO: NivelDiseno[] = [
  'basico', 'intermedio', 'avanzado', 'experto'
];

export interface DisenoCounters {
  basico:     { count: number; precio_promedio: number | null };
  intermedio: { count: number; precio_promedio: number | null };
  avanzado:   { count: number; precio_promedio: number | null };
  experto:    { count: number; precio_promedio: number | null };
}
