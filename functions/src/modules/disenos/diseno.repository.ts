import { getStorage } from 'firebase-admin/storage';
import { db } from '../../config/firebase';
import { Diseno } from './diseno.model';
import { DisenoCounters, NIVELES_DISENO } from './diseno.types';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const collection = db.collection('disenos');
const PAGE_SIZE = 12;
const MIN_DIMENSION = 400;

export const DisenoRepository = {

  async uploadImage(
    buffer: Buffer,
    mimetype: string
  ): Promise<{ foto_url: string; thumb_url: string; foto_path: string; thumb_path: string }> {
    const meta = await sharp(buffer).metadata();
    if ((meta.width ?? 0) < MIN_DIMENSION || (meta.height ?? 0) < MIN_DIMENSION) {
      throw new Error(`La imagen debe ser de al menos ${MIN_DIMENSION}x${MIN_DIMENSION}px`);
    }

    const fullBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 82 })
      .toBuffer();

    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: 75 })
      .toBuffer();

    const id = uuidv4();
    const bucket = getStorage().bucket();
    const fullPath = `disenos/full/${id}.webp`;
    const thumbPath = `disenos/thumbs/${id}.webp`;

    await Promise.all([
      bucket.file(fullPath).save(fullBuffer, {
        metadata: { contentType: 'image/webp' },
        resumable: false,
      }),
      bucket.file(thumbPath).save(thumbBuffer, {
        metadata: { contentType: 'image/webp' },
        resumable: false,
      }),
    ]);

    await Promise.all([
      bucket.file(fullPath).makePublic(),
      bucket.file(thumbPath).makePublic(),
    ]);

    const base = `https://storage.googleapis.com/${bucket.name}`;
    return {
      foto_url: `${base}/${fullPath}`,
      thumb_url: `${base}/${thumbPath}`,
      foto_path: fullPath,
      thumb_path: thumbPath,
    };
  },

  async deleteImage(foto_path: string, thumb_path: string): Promise<void> {
    const bucket = getStorage().bucket();
    await Promise.allSettled([
      bucket.file(foto_path).delete(),
      bucket.file(thumb_path).delete(),
    ]);
  },

  async getDisenos({ nivel, tag, cursor }: { nivel?: string; tag?: string; cursor?: string }) {
    let baseQuery: FirebaseFirestore.Query = collection.orderBy('createdAt', 'desc');

    if (nivel) baseQuery = baseQuery.where('nivel', '==', nivel);
    if (tag) baseQuery = baseQuery.where('tags', 'array-contains', tag);

    // Count
    const countQuery = await baseQuery.count().get();
    const total = countQuery.data().count;

    // Keys Set Pagination
    if (cursor) {
      const cursorDoc = await collection.doc(cursor).get();
      if (cursorDoc.exists) {
        baseQuery = baseQuery.startAfter(cursorDoc);
      }
    }

    // Limit to PAGE_SIZE + 1 to detect if there's more
    const limitQuery = baseQuery.limit(PAGE_SIZE + 1);
    const snap = await limitQuery.get();

    const rawDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diseno));
    const hasMore = rawDocs.length > PAGE_SIZE;
    const items = hasMore ? rawDocs.slice(0, PAGE_SIZE) : rawDocs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, total, nextCursor };
  },

  async getCounters(): Promise<DisenoCounters> {
    const counters: any = {};
    
    await Promise.all(
      NIVELES_DISENO.map(async (nivel) => {
        const queryBase = collection.where('nivel', '==', nivel);
        const [countSnap, pricesSnap] = await Promise.all([
          queryBase.count().get(),
          queryBase.select('precio_cobrado').get()
        ]);

        const count = countSnap.data().count;
        let sum = 0;
        let priceCount = 0;

        pricesSnap.docs.forEach(doc => {
          const val = doc.data().precio_cobrado;
          const numVal = val !== null && val !== undefined ? Number(val) : null;
          if (numVal !== null && !isNaN(numVal) && numVal > 0) {
            sum += numVal;
            priceCount++;
          }
        });

        counters[nivel] = {
          count,
          precio_promedio: priceCount > 0 ? sum / priceCount : null
        };
      })
    );

    return counters as DisenoCounters;
  },

  async getDisenoById(id: string): Promise<Diseno | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Diseno;
  },

  async createDiseno(data: Omit<Diseno, 'id'>): Promise<Diseno> {
    const ref = await collection.add(data);
    return { id: ref.id, ...data };
  },

  async updateDiseno(id: string, data: Partial<Diseno>): Promise<Diseno | null> {
    const ref = collection.doc(id);
    await ref.update(data);
    return this.getDisenoById(id);
  },

  async deleteDiseno(id: string): Promise<boolean> {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  }
};
