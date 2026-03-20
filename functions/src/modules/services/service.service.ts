import * as admin from "firebase-admin";
import { ServiceRepository } from "./service.repository";
import { Service } from "./service.model";

export class ServiceService {
  private repo = new ServiceRepository();

  async getAll() {
    return await this.repo.getAll();
  }

  async getById(id: string) {
    const service = await this.repo.getById(id);
    if (!service) {
      throw new Error("Servicio no encontrado.");
    }
    return service;
  }

  async create(data: Omit<Service, "id" | "createdAt" | "updatedAt">) {
    if (!data.name || data.name.trim() === "") {
      throw new Error("El nombre del servicio es requerido.");
    }
    if (data.basePrice === undefined || data.basePrice < 0) {
      throw new Error("El precio base debe ser mayor o igual a 0.");
    }
    if (data.estimatedMinutes === undefined || data.estimatedMinutes <= 0) {
      throw new Error("El tiempo estimado debe ser mayor a 0.");
    }

    const recipe = (data.recipe || []).map((item) => ({
      ...item,
      totalCost: item.usageAmount * item.costPerUnit,
    }));
    const materialCost = recipe.reduce((sum, item) => sum + item.totalCost, 0);

    const serviceToCreate: Omit<Service, "id"> = {
      ...data,
      suggestedPrice: data.suggestedPrice || 0,
      materialCost,
      needsLength: data.needsLength || false,
      recipe,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    return await this.repo.create(serviceToCreate);
  }

  async update(id: string, data: Partial<Service>) {
    const dataToUpdate: any = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    if (data.recipe) {
      dataToUpdate.recipe = data.recipe.map((item) => ({
        ...item,
        totalCost: item.usageAmount * item.costPerUnit,
      }));
      dataToUpdate.materialCost = dataToUpdate.recipe.reduce(
        (sum: number, item: any) => sum + item.totalCost,
        0
      );
    }

    await this.repo.update(id, dataToUpdate);
  }

  async delete(id: string) {
    const service = await this.repo.getById(id);
    if (!service) {
      throw new Error("Servicio no encontrado.");
    }
    await this.repo.delete(id);
  }
}
