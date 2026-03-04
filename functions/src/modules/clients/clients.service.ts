  import { db } from "../../config/firebase"; 

  export type Client = {

      id: string;
      nombre: string;
      ap_paterno: string;
      ap_materno?: string;
      correo?: string;
      telefono: string;
      tipo: "nuevo" | "frecuente";
      citas_count: number; 
      servicios_count: number;
      status: "activo" | "inactivo";
      createdAt: string;
      updatedAt: string;
  };
  export class ClientsService {
    
    // Función auxiliar privada para mapear los datos de Firebase
    private mapClient(id: string, x: any): Client {
      return {
        id,
        nombre: x.nombre ?? "",
        ap_paterno: x.ap_paterno ?? "",
        ap_materno: x.ap_materno ?? "",
        telefono: x.telefono ?? "",
        correo: x.correo ?? "",
        tipo: x.tipo ?? "nuevo",
        status: x.status ?? "activo",
        citas_count: x.citas_count ?? 0,
        servicios_count: x.servicios_count ?? 0,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      };
    }
    async getAll(limit = 100): Promise<Client[]> {
      const snap = await db
        .collection("clients")
        .where("status", "==", "activo")
        .limit(limit)
        .get();

      return snap.docs.map(d => this.mapClient(d.id, d.data()));
    }
    async getById(id: string): Promise<Client | null> {
      const doc = await db.collection("clients").doc(id).get();
      return doc.exists ? this.mapClient(doc.id, doc.data()) : null;
    }
    async create(clientData: Omit<Client, "id" | "status" | "createdAt" | "updatedAt" | "tipo" | "citas_count" | "servicios_count">): Promise<Client> {
      const ref = db.collection("clients").doc();
      const now = new Date().toISOString();

      const data = {
        ...clientData,
        tipo: "nuevo" as const,    
        citas_count: 0,            
        servicios_count: 0,        
        status: "activo" as const, 
        createdAt: now,
        updatedAt: now,
      };
      await ref.set(data); // Esto guarda los datos físicamente en Firebase
      return this.mapClient(ref.id, data); // Te devuelve el cliente listo para usar, con ID y todo.
    }
    async update(id: string, clientData: Partial<Client>): Promise<Client | null> {
  const ref = db.collection("clients").doc(id);
  const doc = await ref.get();

  if (!doc.exists) return null;

  const currentData = doc.data();

  // Calculamos el nuevo número de citas
  const newCitasCount =
    clientData.citas_count ?? currentData?.citas_count ?? 0;

  // Regla automática de negocio
  const newTipo = newCitasCount >= 5 ? "frecuente" : "nuevo";

  await ref.update({
    ...clientData,
    tipo: newTipo,
    updatedAt: new Date().toISOString(),
  });

  const updated = await ref.get();
  return this.mapClient(updated.id, updated.data());
    }
    async delete(id: string): Promise<boolean> {
      const ref = db.collection("clients").doc(id);
      const doc = await ref.get();
      if (!doc.exists) return false;

      // Soft delete: solo lo marcamos como inactivo
      await ref.update({
        status: "inactivo",
        updatedAt: new Date().toISOString(),
      });
      return true;
    }
  }
  
