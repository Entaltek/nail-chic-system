import { db } from '../../config/firebase';
import { CostoFijo, FondoAhorro, MetaMensual, TipoGastoDB } from './costos.types';

const metaCol = db.collection('metaMensual');
const fijosCol = db.collection('costosFijos');
const fondosCol = db.collection('fondosAhorro');
const tiposCol = db.collection('tiposGasto');

export const CostosRepository = {

  // Meta Mensual
  async getMetaMensual(): Promise<MetaMensual | null> {
    const doc = await metaCol.doc('config').get();
    if (!doc.exists) return null;
    return doc.data() as MetaMensual;
  },

  async upsertMetaMensual(data: MetaMensual): Promise<MetaMensual> {
    await metaCol.doc('config').set(data, { merge: true });
    return data;
  },

  // Resumen Totals Optimization
  async getGastosFijosTotal(): Promise<number> {
    const snap = await fijosCol.select('monto').get();
    return snap.docs.reduce((acc, doc) => acc + (Number(doc.data().monto) || 0), 0);
  },

  async getPorcentajeAhorroTotal(): Promise<number> {
    const snap = await fondosCol.select('porcentaje').get();
    return snap.docs.reduce((acc, doc) => acc + (Number(doc.data().porcentaje) || 0), 0);
  },

  // Costos Fijos
  async getAllCostosFijos(): Promise<CostoFijo[]> {
    const snap = await fijosCol.orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CostoFijo));
  },

  async getCostoFijoById(id: string): Promise<CostoFijo | null> {
    const doc = await fijosCol.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as CostoFijo;
  },

  async createCostoFijo(data: Omit<CostoFijo, 'id'>): Promise<CostoFijo> {
    const ref = await fijosCol.add(data);
    return { id: ref.id, ...data };
  },

  async updateCostoFijo(id: string, data: Partial<Omit<CostoFijo, 'id'>>): Promise<CostoFijo | null> {
    const ref = fijosCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(data);
    return this.getCostoFijoById(id);
  },

  async deleteCostoFijo(id: string): Promise<boolean> {
    const ref = fijosCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  // Fondos Ahorro
  async getAllFondosAhorro(): Promise<FondoAhorro[]> {
    const snap = await fondosCol.orderBy('createdAt', 'asc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FondoAhorro));
  },

  async getFondoAhorroById(id: string): Promise<FondoAhorro | null> {
    const doc = await fondosCol.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as FondoAhorro;
  },

  async getFondoAhorroByNombre(nombre: string): Promise<FondoAhorro | null> {
    const snap = await fondosCol.where('nombre', '==', nombre).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as FondoAhorro;
  },

  async createFondoAhorro(data: Omit<FondoAhorro, 'id'>): Promise<FondoAhorro> {
    const ref = await fondosCol.add(data);
    return { id: ref.id, ...data };
  },

  async updateFondoAhorro(id: string, data: Partial<Omit<FondoAhorro, 'id'>>): Promise<FondoAhorro | null> {
    const ref = fondosCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(data);
    return this.getFondoAhorroById(id);
  },

  async deleteFondoAhorro(id: string): Promise<boolean> {
    const ref = fondosCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  // Tipos de Gasto
  async getAllTiposGasto(): Promise<TipoGastoDB[]> {
    const snap = await tiposCol.orderBy('createdAt', 'asc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoGastoDB));
  },

  async getTipoGastoById(id: string): Promise<TipoGastoDB | null> {
    const doc = await tiposCol.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as TipoGastoDB;
  },

  async getTipoGastoByNombre(nombre: string): Promise<TipoGastoDB | null> {
    const snap = await tiposCol.where('nombre', '==', nombre).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as TipoGastoDB;
  },

  async createTipoGasto(data: Omit<TipoGastoDB, 'id'>): Promise<TipoGastoDB> {
    const ref = await tiposCol.add(data);
    return { id: ref.id, ...data };
  },

  async updateTipoGasto(id: string, data: Partial<Omit<TipoGastoDB, 'id'>>): Promise<TipoGastoDB | null> {
    const ref = tiposCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(data);
    return this.getTipoGastoById(id);
  },

  async deleteTipoGasto(id: string): Promise<boolean> {
    const ref = tiposCol.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async countCostosFijosByTipoId(tipo_gasto_id: string): Promise<number> {
    const snap = await fijosCol.where('tipo_gasto_id', '==', tipo_gasto_id).count().get();
    return snap.data().count;
  }
};
