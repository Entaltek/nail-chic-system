import { CostosRepository } from './costos.repository';
import { MetaMensual, CostoFijo, FondoAhorro, Resumen } from './costos.types';
import { Timestamp } from 'firebase-admin/firestore';

export const CostosService = {

  // --- SUB-MODULE 1: Resumen & Meta Mensual ---
  async getResumen(): Promise<Resumen> {
    const [meta, gastos_fijos_total, porcentaje_ahorro_total] = await Promise.all([
      CostosRepository.getMetaMensual(),
      CostosRepository.getGastosFijosTotal(),
      CostosRepository.getPorcentajeAhorroTotal()
    ]);

    const sueldo_base           = Number(meta?.sueldo_base ?? 0);
    const horas_laborales_mes   = Number(meta?.horas_laborales_mes ?? 160);
    const incluir_aguinaldo     = meta?.incluir_aguinaldo ?? false;
    const aguinaldo_mensual     = Number(meta?.aguinaldo_mensual ?? 0);
    const seguro_medico_mensual = Number(meta?.seguro_medico_mensual ?? 0);

    const subtotal = gastos_fijos_total
                   + sueldo_base
                   + (incluir_aguinaldo ? aguinaldo_mensual : 0)
                   + seguro_medico_mensual;

    const provisiones_total     = subtotal * (porcentaje_ahorro_total / 100);
    const meta_total            = subtotal + provisiones_total;
    const costo_por_minuto      = horas_laborales_mes > 0
                                  ? meta_total / (horas_laborales_mes * 60)
                                  : 0;
    const costo_por_hora        = costo_por_minuto * 60;

    return {
      gastos_fijos_total: Number(gastos_fijos_total.toFixed(2)),
      sueldo_base: Number(sueldo_base.toFixed(2)),
      aguinaldo_mensual: Number(aguinaldo_mensual.toFixed(2)),
      seguro_medico_mensual: Number(seguro_medico_mensual.toFixed(2)),
      provisiones_total: Number(provisiones_total.toFixed(2)),
      meta_total: Number(meta_total.toFixed(2)),
      costo_por_minuto: Number(costo_por_minuto.toFixed(2)),
      costo_por_hora: Number(costo_por_hora.toFixed(2)),
      porcentaje_ahorro_total: Number(porcentaje_ahorro_total.toFixed(2))
    };
  },

  async getMetaMensual(): Promise<MetaMensual> {
    const meta = await CostosRepository.getMetaMensual();
    if (meta) return meta;

    // Default if not exists
    const defaultMeta: MetaMensual = {
      sueldo_base: 0,
      horas_laborales_mes: 160,
      incluir_aguinaldo: false,
      seguro_medico_anual: 0,
      aguinaldo_mensual: 0,
      seguro_medico_mensual: 0,
    };
    return await CostosRepository.upsertMetaMensual(defaultMeta);
  },

  async updateMetaMensual(data: Partial<MetaMensual>): Promise<MetaMensual> {
    const current = await this.getMetaMensual();
    
    const merged: MetaMensual = {
      ...current,
      ...data,
      updatedAt: Timestamp.now()
    };

    // Recalculate computed fields based on possibly new or existing values
    merged.aguinaldo_mensual = merged.sueldo_base / 12;
    // user specifies seguro_medico_anual
    merged.seguro_medico_mensual = merged.seguro_medico_anual / 12;

    return await CostosRepository.upsertMetaMensual(merged);
  },

  // --- SUB-MODULE 2: Costos Fijos ---
  async getCostosFijosGrouped() {
    const [items, tipos] = await Promise.all([
      CostosRepository.getAllCostosFijos(),
      CostosRepository.getAllTiposGasto()
    ]);

    const tiposMap: Record<string, typeof tipos[0]> = {};
    const grupos: Record<string, CostoFijo[]> = {};
    tipos.forEach(t => {
      tiposMap[t.id] = t;
      grupos[t.nombre] = [];
    });

    let total = 0;
    items.forEach(item => {
      const tipo = tiposMap[item.tipo_gasto_id];
      const tipoNombre = tipo ? tipo.nombre : 'Otros';
      item.tipo = tipo || { id: "otros", nombre: "Otros (Huérfano)", color: "#6B7280" };
      if (!grupos[tipoNombre]) grupos[tipoNombre] = [];
      grupos[tipoNombre].push(item);
      total += item.monto;
    });

    return {
      meta: { total },
      data: grupos
    };
  },

  async createCostoFijo(data: any): Promise<CostoFijo> {
    if (!data.nombre) throw new Error("nombre es requerido");
    if (!data.monto || typeof data.monto !== 'number' || data.monto <= 0) throw new Error("monto es requerido y debe ser > 0");
    if (!data.tipo_gasto_id) throw new Error(`tipo_gasto_id es requerido`);

    const tipo = await CostosRepository.getTipoGastoById(data.tipo_gasto_id);
    if (!tipo) throw new Error(`El tipo_gasto_id ${data.tipo_gasto_id} no existe.`);

    const newCosto: Omit<CostoFijo, 'id'> = {
      nombre: data.nombre,
      monto: data.monto,
      etiqueta: data.etiqueta || null,
      tipo_gasto_id: data.tipo_gasto_id,
      presupuesto: data.presupuesto || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const creado = await CostosRepository.createCostoFijo(newCosto);
    creado.tipo = tipo;
    return creado;
  },

  async updateCostoFijo(id: string, data: any): Promise<CostoFijo> {
    if (data.monto !== undefined && (typeof data.monto !== 'number' || data.monto <= 0)) {
      throw new Error("monto debe ser > 0");
    }
    if (data.tipo_gasto_id) {
       const tipo = await CostosRepository.getTipoGastoById(data.tipo_gasto_id);
       if (!tipo) throw new Error(`El tipo_gasto_id ${data.tipo_gasto_id} no existe.`);
    }

    const updates: Partial<Omit<CostoFijo, 'id'>> = { ...data, updatedAt: Timestamp.now() };
    const updated = await CostosRepository.updateCostoFijo(id, updates);
    if (!updated) throw new Error("NOT_FOUND");
    
    if (updated.tipo_gasto_id) {
       updated.tipo = await CostosRepository.getTipoGastoById(updated.tipo_gasto_id) || undefined;
    }
    return updated;
  },

  async deleteCostoFijo(id: string): Promise<boolean> {
    const deleted = await CostosRepository.deleteCostoFijo(id);
    if (!deleted) throw new Error("NOT_FOUND");
    return true;
  },

  // --- SUB-MODULE 3: Fondos Ahorro ---
  async getFondosAhorro() {
    const items = await CostosRepository.getAllFondosAhorro();
    const porcentaje_total = items.reduce((sum, i) => sum + Number(i.porcentaje), 0);
    return {
      meta: { porcentaje_total: Number(porcentaje_total.toFixed(2)) },
      data: items
    };
  },

  async createFondoAhorro(data: any): Promise<FondoAhorro> {
    if (!data.nombre) throw new Error("nombre es requerido");
    if (data.porcentaje === undefined || typeof data.porcentaje !== 'number' || data.porcentaje < 0.1 || data.porcentaje > 100) {
      throw new Error("porcentaje requerido entre 0.1 y 100");
    }

    const existingName = await CostosRepository.getFondoAhorroByNombre(data.nombre);
    if (existingName) throw new Error("Ya existe un fondo con ese nombre");

    const totalPct = await CostosRepository.getPorcentajeAhorroTotal();
    if (totalPct + data.porcentaje > 80) {
      throw new Error(`El total de fondos no puede superar el 80%. Actualmente tienes ${totalPct.toFixed(2)}% asignado.`);
    }

    const newFondo: Omit<FondoAhorro, 'id'> = {
      nombre: data.nombre,
      porcentaje: data.porcentaje,
      icono: data.icono || "piggy-bank",
      acumulado: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    return await CostosRepository.createFondoAhorro(newFondo);
  },

  async updateFondoAhorro(id: string, data: any): Promise<FondoAhorro> {
    if (data.porcentaje !== undefined) {
      if (typeof data.porcentaje !== 'number' || data.porcentaje < 0.1 || data.porcentaje > 100) {
        throw new Error("porcentaje inválido");
      }
      
      const fondos = await CostosRepository.getAllFondosAhorro();
      // Exclude current fondo from sum to check new total
      const totalOther = fondos.filter(f => f.id !== id).reduce((s, f) => s + f.porcentaje, 0);
      
      if (totalOther + data.porcentaje > 80) {
        throw new Error(`El total de fondos no puede superar el 80%. Si excluímos este fondo, los demás ocupan ${totalOther.toFixed(2)}%.`);
      }
    }

    if (data.nombre) {
      const existingName = await CostosRepository.getFondoAhorroByNombre(data.nombre);
      if (existingName && existingName.id !== id) throw new Error("Ya existe otro fondo con ese nombre");
    }

    const updates: Partial<Omit<FondoAhorro, 'id'>> = { ...data, updatedAt: Timestamp.now() };
    const updated = await CostosRepository.updateFondoAhorro(id, updates);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },

  async deleteFondoAhorro(id: string): Promise<boolean> {
    const deleted = await CostosRepository.deleteFondoAhorro(id);
    if (!deleted) throw new Error("NOT_FOUND");
    return true;
  }
};
