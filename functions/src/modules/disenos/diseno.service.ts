import { DisenoRepository } from './diseno.repository';
import { DisenoCreatePayload, DisenoUpdatePayload } from './diseno.model';
import { NIVELES_DISENO } from './diseno.types';
import { Timestamp } from 'firebase-admin/firestore';

interface FileInput {
  buffer:   Buffer;
  mimetype: string;
  size:     number;
}

export const DisenoService = {

  async listDisenos(params: { nivel?: string; tag?: string; cursor?: string }) {
    if (params.nivel && !NIVELES_DISENO.includes(params.nivel as any)) {
      throw new Error(`Nivel inválido. Usa: ${NIVELES_DISENO.join(', ')}`);
    }

    const [disenosData, counters] = await Promise.all([
      DisenoRepository.getDisenos(params),
      DisenoRepository.getCounters()
    ]);

    return {
      items: disenosData.items,
      total: disenosData.total,
      nextCursor: disenosData.nextCursor,
      counters
    };
  },

  async createDiseno(file: FileInput, body: DisenoCreatePayload) {
    if (!file) throw new Error('La foto del diseño es requerida');

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!ALLOWED.includes(file.mimetype)) {
      throw new Error('Formato inválido — usa JPG, PNG o WEBP');
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new Error('La imagen supera los 15MB');
    }

    if (!body.nivel || !NIVELES_DISENO.includes(body.nivel)) {
      throw new Error(`Nivel requerido y debe ser uno de: ${NIVELES_DISENO.join(', ')}`);
    }

    const { foto_url, thumb_url, foto_path, thumb_path } = await DisenoRepository.uploadImage(file.buffer, file.mimetype);

    const tagsArray = body.tags 
      ? body.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const now = Timestamp.now();
    const newDiseno = await DisenoRepository.createDiseno({
      foto_url,
      thumb_url,
      foto_path,
      thumb_path,
      nivel: body.nivel,
      tiempo_real_min: body.tiempo_real_min ? Number(body.tiempo_real_min) : null,
      precio_cobrado: body.precio_cobrado ? Number(body.precio_cobrado) : null,
      tags: tagsArray,
      ingredientes: typeof body.ingredientes === 'string' ? JSON.parse(body.ingredientes) : (body.ingredientes || []),
      createdAt: now,
      updatedAt: now
    });

    return newDiseno;
  },

  async updateDiseno(id: string, body: DisenoUpdatePayload, file?: FileInput) {
    const existing = await DisenoRepository.getDisenoById(id);
    if (!existing) throw new Error('NOT_FOUND');

    if (file) {
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (!ALLOWED.includes(file.mimetype)) throw new Error('Formato inválido — usa JPG, PNG o WEBP');
      if (file.size > 15 * 1024 * 1024) throw new Error('La imagen supera los 15MB');
    }

    let foto_url = existing.foto_url;
    let thumb_url = existing.thumb_url;
    let foto_path = existing.foto_path;
    let thumb_path = existing.thumb_path;

    if (file) {
      const uploaded = await DisenoRepository.uploadImage(file.buffer, file.mimetype);
      foto_url = uploaded.foto_url;
      thumb_url = uploaded.thumb_url;
      foto_path = uploaded.foto_path;
      thumb_path = uploaded.thumb_path;

      if (existing.foto_path && existing.thumb_path) {
        await DisenoRepository.deleteImage(existing.foto_path, existing.thumb_path);
      }
    }

    const updates: any = {
      updatedAt: Timestamp.now()
    };

    if (foto_url !== existing.foto_url) updates.foto_url = foto_url;
    if (thumb_url !== existing.thumb_url) updates.thumb_url = thumb_url;
    if (foto_path !== existing.foto_path) updates.foto_path = foto_path;
    if (thumb_path !== existing.thumb_path) updates.thumb_path = thumb_path;
    
    if (body.nivel !== undefined) updates.nivel = body.nivel;
    if (body.tiempo_real_min !== undefined) updates.tiempo_real_min = body.tiempo_real_min ? Number(body.tiempo_real_min) : null;
    if (body.precio_cobrado !== undefined) updates.precio_cobrado = body.precio_cobrado ? Number(body.precio_cobrado) : null;
    if (body.tags !== undefined) {
      updates.tags = body.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (body.ingredientes !== undefined) {
      updates.ingredientes = typeof body.ingredientes === 'string' ? JSON.parse(body.ingredientes) : body.ingredientes;
    }

    const updated = await DisenoRepository.updateDiseno(id, updates);
    return updated;
  },

  async deleteDiseno(id: string) {
    const existing = await DisenoRepository.getDisenoById(id);
    if (!existing) throw new Error('NOT_FOUND');

    if (existing.foto_path && existing.thumb_path) {
      await DisenoRepository.deleteImage(existing.foto_path, existing.thumb_path);
    }

    await DisenoRepository.deleteDiseno(id);
  }

};
