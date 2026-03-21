import { AdicionalesRepository } from './adicionales.repository';
import { AdicionalCreatePayload, AdicionalUpdatePayload } from './adicionales.model';

export const AdicionalesService = {
  async getAll() {
    const rawItems = await AdicionalesRepository.getAll();
    
    const tecnicas = rawItems.filter(i => i.tipo === 'tecnica').length;
    const aplicaciones = rawItems.filter(i => i.tipo === 'aplicacion').length;
    const total = rawItems.length;
    const precio_promedio = total > 0 
      ? rawItems.reduce((acc, i) => acc + (i.precio_base || 0), 0) / total 
      : 0;

    return {
      meta: {
        total,
        tecnicas,
        aplicaciones,
        precio_promedio
      },
      items: rawItems
    };
  },

  async create(data: AdicionalCreatePayload) {
    if (!data.nombre || !data.tipo) {
      throw new Error('Faltan campos obligatorios');
    }
    
    // Si es tecnica, forzamos que no haya ingredientes 
    // independientemente de la petición.
    if (data.tipo === 'tecnica') {
      data.ingredientes = [];
    }
    
    return AdicionalesRepository.create(data);
  },

  async update(id: string, data: AdicionalUpdatePayload) {
    if (data.tipo === 'tecnica') {
      data.ingredientes = [];
    }
    return AdicionalesRepository.update(id, data);
  },

  async remove(id: string) {
    const ok = await AdicionalesRepository.delete(id);
    if (!ok) throw new Error('No se encontró el adicional a eliminar');
    return ok;
  }
};
