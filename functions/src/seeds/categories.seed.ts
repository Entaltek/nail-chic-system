import { db } from "../config/firebase";

const categories = [
  {
    id: 'limas-pulidores',
    name: 'Limas y Pulidores',
    superCategory: 'CONSUMIBLES_BASICOS',
    description: 'Limas, buffers, pulidores desechables',
    color: 'bg-blue-500',
    icon: '📏',
  },
  {
    id: 'tips-moldes',
    name: 'Tips y Moldes',
    superCategory: 'CONSUMIBLES_BASICOS',
    description: 'Tips Soft Gel, moldes, formas',
    color: 'bg-blue-400',
    icon: '💅',
  },
  {
    id: 'desechables',
    name: 'Desechables',
    superCategory: 'CONSUMIBLES_BASICOS',
    description: 'Guantes, servitoallas, cubrebocas',
    color: 'bg-blue-300',
    icon: '🧤',
  },

  // QUIMICOS
  {
    id: 'acrilicos',
    name: 'Acrílicos',
    superCategory: 'QUIMICOS_GELES',
    description: 'Monómero, polvo acrílico, primer',
    color: 'bg-purple-500',
    icon: '🧪',
  },
  {
    id: 'geles',
    name: 'Geles y Rubber',
    superCategory: 'QUIMICOS_GELES',
    description: 'Base coat, top coat, rubber base, gel color',
    color: 'bg-purple-400',
    icon: '✨',
  },

  // DECORACION
  {
    id: 'charms-accesorios',
    name: 'Charms y Accesorios',
    superCategory: 'DECORACION_CONTABLE',
    description: 'Charms, moños, stickers, cristales grandes',
    color: 'bg-pink-500',
    icon: '🎀',
  },

  {
    id: 'efectos-polvo',
    name: 'Efectos y Polvos',
    superCategory: 'DECORACION_GRANEL',
    description: 'Glitter, efecto espejo, aurora',
    color: 'bg-rose-400',
    icon: '🌟',
  },

  // EQUIPO
  {
    id: 'equipo-electrico',
    name: 'Equipo Eléctrico',
    superCategory: 'EQUIPO_HERRAMIENTAS',
    description: 'Drill, lámpara UV/LED',
    color: 'bg-amber-500',
    icon: '🔌',
  },
];

export async function seedCategories() {
  const batch = db.batch();

  categories.forEach((category) => {
    const ref = db.collection('inventoryCategories').doc(category.id);
    batch.set(ref, {
      ...category,
      createdAt: new Date(),
    });
  });

  await batch.commit();
  console.log('✅ Categorías iniciales creadas');
}
