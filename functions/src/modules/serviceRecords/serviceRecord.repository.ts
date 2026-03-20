import { db } from "../../config/firebase";
import { ServiceRecord } from "./serviceRecord.model";

const collection = db.collection("serviceRecords");

export const ServiceRecordRepository = {
  async findByOwnerId(ownerId: string): Promise<ServiceRecord[]> {
    const snap = await collection
      .where("ownerId", "==", ownerId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceRecord));
  },

  async findById(id: string): Promise<ServiceRecord | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ServiceRecord;
  },

  async findByClient(ownerId: string, clientId: string): Promise<ServiceRecord[]> {
    const snap = await collection
      .where("ownerId", "==", ownerId)
      .where("clientId", "==", clientId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceRecord));
  },

  async create(data: Omit<ServiceRecord, "id">): Promise<string> {
    const ref = await collection.add(data);
    return ref.id;
  },
};
