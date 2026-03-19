import { db } from "../../config/firebase";
import { Client, ClientBase } from "./clients.model";

const collection = db.collection("clients");

export const ClientsRepository = {
  mapClient(id: string, data: any): Client {
    return {
      id,
      firstName: data.firstName ?? "",
      paternalSurname: data.paternalSurname ?? "",
      maternalSurname: data.maternalSurname ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      type: data.type ?? "nuevo",
      status: data.status ?? "activo",
      appointmentsCount: data.appointmentsCount ?? 0,
      servicesCount: data.servicesCount ?? 0,
      createdAt: data.createdAt ?? "",
      updatedAt: data.updatedAt ?? "",
    };
  },

  async findAll(limit = 100): Promise<Client[]> {
    const snap = await collection
      .where("status", "==", "activo")
      .limit(limit)
      .get();

    return snap.docs.map((doc) => this.mapClient(doc.id, doc.data()));
  },

  async findById(id: string): Promise<Client | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (data?.status === "inactivo") return null;

    return this.mapClient(doc.id, data);
  },

  async create(data: ClientBase): Promise<Client> {
    const ref = collection.doc();
    const now = new Date().toISOString();

    const payload = {
      ...data,
      appointmentsCount: 0,
      servicesCount: 0,
      status: "activo" as const,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(payload);
    return this.mapClient(ref.id, payload);
  },

  async update(
    id: string,
    data: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>
  ): Promise<Client | null> {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const currentData = doc.data() ?? {};
    const newAppointmentsCount = data.appointmentsCount ?? currentData.appointmentsCount ?? 0;

    const computedType =
      currentData.type === "frecuente"
        ? "frecuente"
        : newAppointmentsCount >= 3
        ? "frecuente"
        : "nuevo";

    await ref.update({
      ...data,
      type: computedType,
      updatedAt: new Date().toISOString(),
    });

    const updated = await ref.get();
    return this.mapClient(updated.id, updated.data());
  },

  async softDelete(id: string): Promise<boolean> {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;

    await ref.update({
      status: "inactivo",
      updatedAt: new Date().toISOString(),
    });

    return true;
  },

  async findByPhone(phone: string): Promise<Client | null> {
    const snap = await collection
      .where("phone", "==", phone)
      .where("status", "==", "activo")
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return this.mapClient(doc.id, doc.data());
  },
};