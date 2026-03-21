import { db } from '../../config/firebase';
import { Adicional, AdicionalCreatePayload, AdicionalUpdatePayload } from './adicionales.model';
import { FieldValue } from 'firebase-admin/firestore';

const col = db.collection('adicionales');
const invCol = db.collection('inventoryItems');

export const AdicionalesRepository = {
  async getAll(): Promise<any[]> {
    const snap = await col.orderBy('createdAt', 'desc').get();
    
    // We will populate ingredients for all items
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Adicional));
    
    return Promise.all(docs.map(async (doc) => {
      const populated = await this.getInventoryDetails(doc.ingredientes || []);
      return {
        ...doc,
        ingredientes: populated
      };
    }));
  },

  async getById(id: string): Promise<any | null> {
    const doc = await col.doc(id).get();
    if (!doc.exists) return null;
    const data = { id: doc.id, ...doc.data() } as Adicional;
    
    const populated = await this.getInventoryDetails(data.ingredientes || []);
    return {
      ...data,
      ingredientes: populated
    };
  },

  async create(data: AdicionalCreatePayload): Promise<any> {
    const defaultData = {
      ...data,
      ingredientes: data.ingredientes || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await col.add(defaultData);
    return this.getById(ref.id);
  },

  async update(id: string, data: AdicionalUpdatePayload): Promise<any | null> {
    const ref = col.doc(id);
    await ref.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    const ref = col.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },

  async getInventoryDetails(ingredientes: { producto_id: string; cantidad: number }[]) {
    if (!ingredientes || ingredientes.length === 0) return [];
    
    return await Promise.all(
      ingredientes.map(async (ing) => {
        const doc = await invCol.doc(ing.producto_id).get();
        if (!doc.exists) {
          return {
            producto_id: ing.producto_id,
            cantidad: ing.cantidad,
            producto: null
          };
        }
        
        const data = doc.data() as any;
        return {
          producto_id: ing.producto_id,
          cantidad: ing.cantidad,
          producto: {
            id: doc.id,
            nombre: data?.name,
            costo: data?.purchaseCost,
            unidad: data?.contentUnit ?? 'u',
          }
        };
      })
    );
  }
};
