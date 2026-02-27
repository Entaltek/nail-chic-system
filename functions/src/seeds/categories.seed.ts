import {db} from "../config/firebase";
import {Timestamp} from "firebase-admin/firestore";

const now = Timestamp.now();

const categories = [
  {
    name: "Limas y Pulidores",
    superCategory: "CONSUMIBLES_BASICOS",
    description: "Limas, buffers, pulidores desechables",
    icon: {
      emoji: "📏",
      bgClass: "bg-blue-500",
    },
    inventoryVariant: "EXACT_PIECE",
    isActive: true,
    order: 1,
  },
  {
    name: "Tips y Moldes",
    superCategory: "CONSUMIBLES_BASICOS",
    description: "Tips Soft Gel, moldes, formas",
    icon: {
      emoji: "💅",
      bgClass: "bg-blue-400",
    },
    inventoryVariant: "EXACT_PIECE",
    isActive: true,
    order: 2,
  },
  {
    name: "Desechables",
    superCategory: "CONSUMIBLES_BASICOS",
    description: "Guantes, servitoallas, cubrebocas",
    icon: {
      emoji: "🧤",
      bgClass: "bg-blue-300",
    },
    inventoryVariant: "EXACT_PIECE",
    isActive: true,
    order: 3,
  },
  {
    name: "Acrílicos",
    superCategory: "QUIMICOS_GELES",
    description: "Monómero, polvo acrílico, primer",
    icon: {
      emoji: "🧪",
      bgClass: "bg-purple-500",
    },
    inventoryVariant: "DROP_CALC",
    isActive: true,
    order: 4,
  },
  {
    name: "Geles y Rubber",
    superCategory: "QUIMICOS_GELES",
    description: "Base coat, top coat, rubber base, gel color",
    icon: {
      emoji: "✨",
      bgClass: "bg-purple-400",
    },
    inventoryVariant: "DROP_CALC",
    isActive: true,
    order: 5,
  },
  {
    name: "Charms y Accesorios",
    superCategory: "DECORACION_CONTABLE",
    description: "Charms, moños, stickers, cristales grandes",
    icon: {
      emoji: "🎀",
      bgClass: "bg-pink-500",
    },
    inventoryVariant: "HIGH_VALUE",
    isActive: true,
    order: 6,
  },
  {
    name: "Efectos y Polvos",
    superCategory: "DECORACION_GRANEL",
    description: "Glitter, efecto espejo, aurora",
    icon: {
      emoji: "🌟",
      bgClass: "bg-rose-400",
    },
    inventoryVariant: "VISUAL_STATE",
    isActive: true,
    order: 7,
  },
  {
    name: "Equipo Eléctrico",
    superCategory: "EQUIPO_HERRAMIENTAS",
    description: "Drill, lámpara UV/LED",
    icon: {
      emoji: "🔌",
      bgClass: "bg-amber-500",
    },
    inventoryVariant: "DEPRECIATION",
    isActive: true,
    order: 8,
  },
];

export async function seedCategories() {
  const batch = db.batch();

  categories.forEach((category) => {
    const ref = db.collection("inventoryCategories").doc();

    batch.set(ref, {
      ...category,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}
