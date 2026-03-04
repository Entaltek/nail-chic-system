import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

export async function seedInventory() {
  const batch = db.batch();
  const ref = db.collection("inventoryItems");

  const now = Timestamp.now();

  const items = [
    // 🧤 CONSUMIBLES
    {
      name: "Guantes Nitrilo (Caja 100)",
      description: "Caja con 100 piezas talla mediana",
      category: "CONSUMIBLES",
      purchaseCost: 200,
      presentationQuantity: 100,
      stockPieces: 85,
      minStock: 30,
      dailyUsage: 5,
      unit: "PIEZA",
      currency: "MXN",
      isActive: true,
    },
    {
      name: "Lima 100/180",
      description: "Lima profesional doble grano",
      category: "CONSUMIBLES",
      purchaseCost: 150,
      presentationQuantity: 10,
      stockPieces: 8, // bajo stock
      minStock: 15,
      dailyUsage: 2,
      unit: "PIEZA",
      currency: "MXN",
      isActive: true,
    },

    // 🧪 QUÍMICOS
    {
      name: "Monómero Acrílico 500ml",
      description: "Presentación profesional",
      category: "QUIMICOS",
      purchaseCost: 500,
      presentationQuantity: 500,
      stockPieces: 425,
      minStock: 100,
      dailyUsage: 20,
      unit: "ML",
      currency: "MXN",
      isActive: true,
    },
    {
      name: "Rubber Base 15ml",
      description: "Base flexible para esmalte",
      category: "QUIMICOS",
      purchaseCost: 350,
      presentationQuantity: 15,
      stockPieces: 5, // crítico
      minStock: 10,
      dailyUsage: 1,
      unit: "ML",
      currency: "MXN",
      isActive: true,
    },

    // 💎 DECORACIÓN
    {
      name: "Glitter Holográfico 10g",
      description: "Polvo efecto holográfico",
      category: "DECORACION",
      purchaseCost: 120,
      presentationQuantity: 10,
      stockPieces: 2,
      minStock: 5,
      dailyUsage: 0.5,
      unit: "GR",
      currency: "MXN",
      isActive: true,
    },

    // 🔧 HERRAMIENTAS
    {
      name: "Drill Profesional",
      description: "Torno eléctrico profesional para uñas",
      category: "HERRAMIENTAS",
      purchaseCost: 2500,
      presentationQuantity: 1,
      stockPieces: 1,
      minStock: 1,
      dailyUsage: 0,
      unit: "PIEZA",
      currency: "MXN",
      isActive: true,
    },

    // 🔥 Para probar soft delete
    {
      name: "Kit Pinceles Nail Art",
      description: "Kit profesional 12 piezas",
      category: "HERRAMIENTAS",
      purchaseCost: 600,
      presentationQuantity: 12,
      stockPieces: 12,
      minStock: 3,
      dailyUsage: 0.3,
      unit: "KIT",
      currency: "MXN",
      isActive: false,
    },
  ];

  items.forEach((item) => {
    const docRef = ref.doc(); // 🔥 Firebase genera ID automático

    batch.set(docRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}