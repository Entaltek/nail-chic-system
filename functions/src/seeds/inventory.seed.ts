import { db } from "../config/firebase";

export async function seedInventory() {
  const batch = db.batch();
  const ref = db.collection("inventoryItems");

  const items = [
    // 🧤 CONSUMIBLES_BASICOS
    {
      id: "guantes-nitrilo",
      name: "Guantes Nitrilo (Caja 100)",
      categoryId: "desechables",
      category: "Desechables",
      superCategory: "CONSUMIBLES_BASICOS",
      purchaseCost: 200,
      stockPieces: 85,
      minStockPieces: 20,
      costPerPiece: 2,
      weeklyUsageRate: 25,
      daysUntilEmpty: 24,
      createdAt: new Date(),
    },
    {
      id: "lima-100-180",
      name: "Lima 100/180",
      categoryId: "limas-pulidores",
      category: "Limas y Pulidores",
      superCategory: "CONSUMIBLES_BASICOS",
      purchaseCost: 150,
      stockPieces: 50,
      minStockPieces: 10,
      costPerPiece: 3,
      weeklyUsageRate: 15,
      daysUntilEmpty: 23,
      createdAt: new Date(),
    },

    // 🧪 QUIMICOS_GELES
    {
      id: "monomero",
      name: "Monómero Acrílico",
      categoryId: "acrilicos",
      category: "Acrílicos",
      superCategory: "QUIMICOS_GELES",
      purchaseCost: 500,
      totalContent: 500,
      contentUnit: "ml",
      currentStock: 425,
      minStock: 100,
      estimatedUses: 100,
      costPerUse: 5,
      createdAt: new Date(),
    },
    {
      id: "rubber-base",
      name: "Rubber Base",
      categoryId: "geles",
      category: "Geles",
      superCategory: "QUIMICOS_GELES",
      purchaseCost: 350,
      totalContent: 30,
      contentUnit: "ml",
      currentStock: 25,
      minStock: 10,
      estimatedUses: 30,
      costPerUse: 11.67,
      createdAt: new Date(),
    },

    // 💎 DECORACION_CONTABLE
    {
      id: "swarovski-mix",
      name: "Cristales Swarovski Mix",
      categoryId: "charms-accesorios",
      category: "Charms y Accesorios",
      superCategory: "DECORACION_CONTABLE",
      purchaseCost: 400,
      stockPieces: 425,
      minStockPieces: 100,
      costPerPiece: 0.8,
      weeklyUsageRate: 30,
      daysUntilEmpty: 99,
      createdAt: new Date(),
    },

    // ✨ DECORACION_GRANEL
    {
      id: "glitter-holografico",
      name: "Glitter Holográfico",
      categoryId: "efectos-polvo",
      category: "Efectos y Polvos",
      superCategory: "DECORACION_GRANEL",
      purchaseCost: 120,
      visualStatus: "lleno",
      createdAt: new Date(),
    },
    {
      id: "efecto-espejo-plata",
      name: "Efecto Espejo Plata",
      categoryId: "efectos-polvo",
      category: "Efectos y Polvos",
      superCategory: "DECORACION_GRANEL",
      purchaseCost: 180,
      visualStatus: "medio",
      createdAt: new Date(),
    },

    // 🔧 EQUIPO_HERRAMIENTAS
    {
      id: "drill-pro",
      name: "Drill Profesional",
      categoryId: "equipo-electrico",
      category: "Equipo Eléctrico",
      superCategory: "EQUIPO_HERRAMIENTAS",
      purchaseCost: 2500,
      purchaseDate: "2024-06-01",
      usefulLifeMonths: 24,
      monthlyDepreciation: 104.17,
      createdAt: new Date(),
    },
  ];

  items.forEach((item) => {
    const doc = ref.doc();
    batch.set(doc, {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  await batch.commit();
}
