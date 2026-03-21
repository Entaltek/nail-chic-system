import { getFirestore } from 'firebase-admin/firestore';
import { Sesion } from './sesiones.model';

const db = getFirestore();
const sesionesCol = db.collection('sesiones');
const servicesCol = db.collection('services');
const adicionalesCol = db.collection('adicionales');

export const SesionesRepository = {
  async getServiceById(id: string) {
    const doc = await servicesCol.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as any;
  },

  async getAdicionalesByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    
    // Firestore in limit is 10, handled safely or assumed <10 for now
    const snaps = await adicionalesCol.where('__name__', 'in', ids).get();
    return snaps.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },

  async createSesion(data: Omit<Sesion, 'id'>): Promise<Sesion> {
    const docRef = sesionesCol.doc();
    const sesion: Sesion = {
      id: docRef.id,
      ...data
    };
    await docRef.set(sesion);
    return sesion;
  }
};
