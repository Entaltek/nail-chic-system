import {db} from "../../config/firebase";
import {InventoryItem, InventoryItemInput} from "./inventoryItem.model";
import {Timestamp} from "firebase-admin/firestore";

const collection = db.collection("inventoryItems");

export const InventoryRepository = {
  async findAll(): Promise<InventoryItem[]> {
    const snapshot = await collection.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as InventoryItemInput & {
        isActive: boolean;
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };

      return {
        id: doc.id,
        ...data,
      };
    });
  },

  async findById(id: string): Promise<InventoryItem | null> {
    const doc = await collection.doc(id).get();

    if (!doc.exists) return null;

    const data = doc.data() as InventoryItemInput & {
      isActive: boolean;
      createdAt: Timestamp;
      updatedAt: Timestamp;
    };

    return {
      id: doc.id,
      ...data,
    };
  },

  async create(data: InventoryItemInput): Promise<InventoryItem> {
    const now = Timestamp.now();

    const docRef = await collection.add({
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const newDoc = await docRef.get();

    return {
      id: newDoc.id,
      ...(newDoc.data() as InventoryItemInput & {
        isActive: boolean;
        createdAt: Timestamp;
        updatedAt: Timestamp;
      }),
    };
  },

  async update(
    id: string,
    data: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>
  ): Promise<InventoryItem | null> {
    const docRef = collection.doc(id);

    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();

    return {
      id: updatedDoc.id,
      ...(updatedDoc.data() as InventoryItemInput & {
        isActive: boolean;
        createdAt: Timestamp;
        updatedAt: Timestamp;
      }),
    };
  },
};
