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
      inventoryId: "CONSUMIBLE_GUANTES",
      cost: {
        amount: 200,
        currency: "MXN",
        per: "CAJA",
      },
      stock: {
        value: 85,
        unit: "PIEZA",
      },
      isActive: true,
    },
    {
      name: "Lima 100/180",
      description: "Lima profesional doble grano",
      inventoryId: "CONSUMIBLE_LIMA_100_180",
      cost: {
        amount: 150,
        currency: "MXN",
        per: "PAQUETE",
      },
      stock: {
        value: 50,
        unit: "PIEZA",
      },
      isActive: true,
    },

    // 🧪 QUÍMICOS
    {
      name: "Monómero Acrílico",
      description: "Presentación de 500ml",
      inventoryId: "QUIMICO_MONOMERO",
      cost: {
        amount: 500,
        currency: "MXN",
        per: "BOTELLA",
      },
      stock: {
        value: 425,
        unit: "ML",
      },
      isActive: true,
    },
    {
      name: "Rubber Base",
      description: "Base flexible para esmalte semipermanente",
      inventoryId: "QUIMICO_RUBBER_BASE",
      cost: {
        amount: 350,
        currency: "MXN",
        per: "BOTELLA",
      },
      stock: {
        value: 25,
        unit: "ML",
      },
      isActive: true,
    },

    // 💎 DECORACIÓN
    {
      name: "Cristales Swarovski Mix",
      description: "Mix de cristales tamaño variado",
      inventoryId: "DECORACION_SWAROVSKI",
      cost: {
        amount: 400,
        currency: "MXN",
        per: "PAQUETE",
      },
      stock: {
        value: 425,
        unit: "PIEZA",
      },
      isActive: true,
    },

    {
      name: "Glitter Holográfico",
      description: "Polvo efecto holográfico",
      inventoryId: "DECORACION_GLITTER_HOLO",
      cost: {
        amount: 120,
        currency: "MXN",
        per: "FRASCO",
      },
      stock: {
        value: 50,
        unit: "GR",
      },
      isActive: true,
    },

    // 🔧 HERRAMIENTAS
    {
      name: "Drill Profesional",
      description: "Torno eléctrico profesional para uñas",
      inventoryId: "HERRAMIENTA_DRILL",
      cost: {
        amount: 2500,
        currency: "MXN",
        per: "PIEZA",
      },
      stock: {
        value: 1,
        unit: "PIEZA",
      },
      isActive: true,
    },
  ];

  items.forEach((item) => {
    const docRef = ref.doc();

    batch.set(docRef, {
      id: docRef.id,
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}