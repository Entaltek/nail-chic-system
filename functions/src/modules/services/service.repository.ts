
import { db } from "../../config/firebase";
import { Service } from "./service.model";

const collection = db.collection("services");

export class ServiceRepository {
  async getAll(): Promise<Service[]> {
    const snapshot = await collection.orderBy("createdAt", "asc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Service));
  }

  async getById(id: string): Promise<Service | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Service;
  }

  async create(data: Omit<Service, "id">): Promise<Service> {
    const docRef = await collection.add(data);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Service;
  }

  async update(id: string, data: Partial<Service>): Promise<void> {
    await collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await collection.doc(id).delete();
  }
}
