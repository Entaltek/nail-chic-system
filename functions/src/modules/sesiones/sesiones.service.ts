import { Timestamp } from 'firebase-admin/firestore';
import { SesionesRepository } from './sesiones.repository';
import { IniciarSesionPayload, SesionAdicional, FinalizarSesionPayload } from './sesiones.model';

export const SesionesService = {
  async iniciarSesion(payload: IniciarSesionPayload) {
    if (!payload.servicio_id) {
      throw new Error("servicio_id es requerido");
    }

    const servicio = await SesionesRepository.getServiceById(payload.servicio_id);
    if (!servicio) {
      throw new Error("Servicio no encontrado");
    }

    let adicionalesDetalle: SesionAdicional[] = [];
    if (payload.adicionales_ids && payload.adicionales_ids.length > 0) {
      // Chunking if > 10
      const chunks = [];
      for (let i = 0; i < payload.adicionales_ids.length; i += 10) {
        chunks.push(payload.adicionales_ids.slice(i, i + 10));
      }
      for (const chunk of chunks) {
        const adis = await SesionesRepository.getAdicionalesByIds(chunk);
        adicionalesDetalle.push(...adis.map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          tipo: a.tipo,
          precio_base: a.precio_base || 0,
          tiempo_extra_min: a.tiempo_extra_min || 0
        })));
      }
    }

    const precio_adicionales = adicionalesDetalle.reduce((acc, curr) => acc + curr.precio_base, 0);
    const tiempo_adicionales = adicionalesDetalle.reduce((acc, curr) => acc + curr.tiempo_extra_min, 0);
    
    // Asignaciones directas desde service.model.ts
    const servicio_precio = servicio.basePrice || 0;
    const duracion_servicio = servicio.estimatedMinutes || 0;

    const sessionData = {
      servicio_id: payload.servicio_id,
      servicio_nombre: servicio.name || 'Sin nombre',
      servicio_precio,
      trabajador_id: payload.trabajador_id || 'dummy',
      trabajador_nombre: payload.trabajador_id ? 'Técnica asignada' : 'Técnica', 
      cliente_id: payload.cliente_id || null,
      adicionales: adicionalesDetalle,
      precio_adicionales,
      precio_estimado: servicio_precio + precio_adicionales,
      precio_cobrado: null,
      tiempo_estimado_min: duracion_servicio + tiempo_adicionales,
      duracion_real_min: null,
      inicio: Timestamp.now(),
      fin: null,
      estado: 'en_curso' as const,
      metodo_pago: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    return await SesionesRepository.createSesion(sessionData);
  },

  async finalizarSesion(id: string, payload: FinalizarSesionPayload) {
    const sesion = await SesionesRepository.getSesionById(id);
    if (!sesion) {
      throw new Error("Sesión no encontrada");
    }
    if (sesion.estado === 'finalizado') {
      throw new Error("La sesión ya se encuentra finalizada");
    }

    const updateData = {
      estado: 'finalizado' as const,
      precio_cobrado: payload.precio_cobrado,
      metodo_pago: payload.metodo_pago,
      duracion_real_min: payload.duracion_real_min,
      fin: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await SesionesRepository.finalizarSesion(id, updateData);
    
    // Devolver la sesión actualizada
    return await SesionesRepository.getSesionById(id);
  }
};
