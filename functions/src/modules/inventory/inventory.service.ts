import {InventoryRepository} from "./inventory.repository";
import {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from "./inventoryItem.model";
import {CategoryRepository} from "../categories/category.repository";

const throwBusiness = (message: string): never => {
  throw {
    status: 2,
    message,
  };
};

const calculateDerivedFields = (
  purchaseCost: number,
  stockPieces: number,
  weeklyUsageRate: number
) => {
  const costPerPiece = purchaseCost;
  const daysUntilEmpty =
    weeklyUsageRate === 0 ?
      null :
      Number(((stockPieces / weeklyUsageRate) * 7).toFixed(2));

  return {costPerPiece, daysUntilEmpty};
};

export const InventoryService = {
  async getAll() {
    const items = await InventoryRepository.findAll();
    return items.filter((i) => i.isActive);
  },

  async getById(id: string) {
    const item = await InventoryRepository.findById(id);

    if (!item || !item.isActive) {
      throw new Error("Producto no encontrado");
    }

    return item;
  },

  async create(data: CreateInventoryItemInput) {
    if (!data.name?.trim()) {
      throwBusiness("El nombre es obligatorio");
    }

    if (data.purchaseCost < 0) {
      throwBusiness("El costo no puede ser negativo");
    }

    if (data.stockPieces < 0) {
      throwBusiness("El stock no puede ser negativo");
    }

    if (data.minStockPieces < 0) {
      throwBusiness("El stock minimo no puede ser negativo");
    }

    if (data.minStockPieces > data.stockPieces) {
      throwBusiness("El stock minimo no puede ser mayor al stock actual");
    }

    if (data.weeklyUsageRate < 0) {
      throwBusiness("El consumo semanal no puede ser negativo");
    }

    const categoryRecord = await CategoryRepository.findById(data.categoryId);
    if (!categoryRecord || !categoryRecord.isActive) {
      throwBusiness("La categoria no existe");
    }
    const category = categoryRecord!;

    if (category.superCategory !== data.superCategory) {
      throwBusiness("La super categoria no coincide con la categoria");
    }

    const derived = calculateDerivedFields(
      data.purchaseCost,
      data.stockPieces,
      data.weeklyUsageRate
    );

    return InventoryRepository.create({
      ...data,
      name: data.name.trim(),
      category: category.name,
      ...derived,
      isActive: true,
    });
  },

  async update(id: string, data: UpdateInventoryItemInput) {
    if (!id) {
      throwBusiness("Id requerido");
    }

    const current = await InventoryRepository.findById(id);
    if (!current || !current.isActive) {
      throw new Error("Producto no encontrado");
    }

    const merged = {
      name: data.name?.trim() ?? current.name,
      categoryId: data.categoryId ?? current.categoryId,
      superCategory: data.superCategory ?? current.superCategory,
      purchaseCost: data.purchaseCost ?? current.purchaseCost,
      stockPieces: data.stockPieces ?? current.stockPieces,
      minStockPieces: data.minStockPieces ?? current.minStockPieces,
      weeklyUsageRate: data.weeklyUsageRate ?? current.weeklyUsageRate,
    };

    if (!merged.name) {
      throwBusiness("El nombre es obligatorio");
    }

    if (merged.purchaseCost < 0) {
      throwBusiness("El costo no puede ser negativo");
    }

    if (merged.stockPieces < 0) {
      throwBusiness("El stock no puede ser negativo");
    }

    if (merged.minStockPieces < 0) {
      throwBusiness("El stock minimo no puede ser negativo");
    }

    if (merged.minStockPieces > merged.stockPieces) {
      throwBusiness("El stock minimo no puede ser mayor al stock actual");
    }

    if (merged.weeklyUsageRate < 0) {
      throwBusiness("El consumo semanal no puede ser negativo");
    }

    const categoryRecord = await CategoryRepository.findById(merged.categoryId);
    if (!categoryRecord || !categoryRecord.isActive) {
      throwBusiness("La categoria no existe");
    }
    const category = categoryRecord!;

    if (category.superCategory !== merged.superCategory) {
      throwBusiness("La super categoria no coincide con la categoria");
    }

    const derived = calculateDerivedFields(
      merged.purchaseCost,
      merged.stockPieces,
      merged.weeklyUsageRate
    );

    const updated = await InventoryRepository.update(id, {
      ...data,
      ...merged,
      category: category.name,
      ...derived,
    });

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  },

  async delete(id: string) {
    if (!id) {
      throw {
        status: 2,
        message: "Id requerido",
      };
    }

    const updated = await InventoryRepository.update(id, {
      isActive: false,
    });

    if (!updated) {
      throw new Error("Producto no encontrado");
    }

    return updated;
  },
};
