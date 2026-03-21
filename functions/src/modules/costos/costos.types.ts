import { Timestamp } from 'firebase-admin/firestore';

// Se remueve "TipoGasto" type y se usa colección Firestore
export interface TipoGastoDB {
  id: string;
  nombre: string;
  color: string;
  createdAt?: FirebaseFirestore.Timestamp;
}

export interface MetaMensual {
  sueldo_base: number;
  horas_laborales_mes: number;
  incluir_aguinaldo: boolean;
  seguro_medico_anual: number;
  aguinaldo_mensual: number;
  seguro_medico_mensual: number;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface CostoFijo {
  id: string;
  nombre: string;
  monto: number;
  etiqueta: string | null;
  tipo_gasto_id: string; // Relational
  tipo?: TipoGastoDB; // Populated by service
  presupuesto: number | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface FondoAhorro {
  id:         string;
  nombre:     string;
  porcentaje: number;
  icono:      string;
  acumulado:  number;
  createdAt:  Timestamp;
  updatedAt:  Timestamp;
}

export interface Resumen {
  gastos_fijos_total:    number;
  sueldo_base:           number;
  aguinaldo_mensual:     number;
  seguro_medico_mensual: number;
  provisiones_total:     number;
  meta_total:            number;
  costo_por_minuto:      number;
  costo_por_hora:        number;
  porcentaje_ahorro_total: number;
}
