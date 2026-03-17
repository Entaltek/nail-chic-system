import * as admin from 'firebase-admin';

export interface UserPermission {
  id: string; // Same as userId
  userId: string;
  email: string;
  displayName?: string;
  modules: {
    dashboard: boolean;
    'servicio-en-curso': boolean;
    'menu-servicios': boolean;
    inventario: boolean;
    categorias: boolean;
    'extras-arte': boolean;
    'catalogo-disenos': boolean;
    reportes: boolean;
    clientes: boolean;
    'costos-gastos': boolean;
    configuracion: boolean;
  };
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

export const DEFAULT_PERMISSIONS: UserPermission['modules'] = {
  dashboard: false,
  'servicio-en-curso': false,
  'menu-servicios': false,
  inventario: false,
  categorias: false,
  'extras-arte': false,
  'catalogo-disenos': false,
  reportes: false,
  clientes: false,
  'costos-gastos': false,
  configuracion: false,
};
