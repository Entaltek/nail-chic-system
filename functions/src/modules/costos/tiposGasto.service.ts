import { Timestamp } from 'firebase-admin/firestore';
import { CostosRepository } from './costos.repository';
import { TipoGastoDB } from './costos.types';

export const TiposGastoService = {

  async listTiposGasto(): Promise<(TipoGastoDB & { gastos_count: number })[]> {
    const tipos = await CostosRepository.getAllTiposGasto();
    const withCounts = await Promise.all(tipos.map(async (tipo) => {
      const count = await CostosRepository.countCostosFijosByTipoId(tipo.id);
      return { ...tipo, gastos_count: count };
    }));
    return withCounts;
  },

  async createTipoGasto(data: { nombre: string; color: string }): Promise<TipoGastoDB> {
    const exists = await CostosRepository.getTipoGastoByNombre(data.nombre);
    if (exists) {
      const error: any = new Error(`El tipo de gasto "${data.nombre}" ya existe.`);
      error.status = 422;
      throw error;
    }
    return CostosRepository.createTipoGasto({
      nombre: data.nombre,
      color: data.color,
      createdAt: Timestamp.now()
    });
  },

  async updateTipoGasto(id: string, data: { nombre?: string; color?: string }): Promise<TipoGastoDB> {
    if (data.nombre) {
      const exists = await CostosRepository.getTipoGastoByNombre(data.nombre);
      if (exists && exists.id !== id) {
        const error: any = new Error(`El nombre "${data.nombre}" ya está en uso.`);
        error.status = 422;
        throw error;
      }
    }
    const updated = await CostosRepository.updateTipoGasto(id, data);
    if (!updated) {
       const err: any = new Error("Tipo de gasto no encontrado");
       err.status = 404;
       throw err;
    }
    return updated;
  },

  async deleteTipoGasto(id: string): Promise<void> {
    const count = await CostosRepository.countCostosFijosByTipoId(id);
    if (count > 0) {
       const err: any = new Error(`No se puede eliminar: tiene ${count} gastos asociados`);
       err.status = 409;
       throw err;
    }
    const ok = await CostosRepository.deleteTipoGasto(id);
    if (!ok) {
        const err: any = new Error("Tipo de gasto no encontrado");
        err.status = 404;
        throw err;
    }
  }
};
