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

  async getHistorial(clienteId: string) {
    const sesionesSnap = await db.collection("sesiones")
      .where("cliente_id", "==", clienteId)
      .where("estado", "==", "finalizado")
      .orderBy("fin", "desc")
      .get();

    return sesionesSnap.docs.map((d: any) => {
      const s = d.data();
      return {
        servicio_nombre:    s.servicio_nombre    ?? "Servicio",
        duracion_real_min:  s.duracion_real_min  ?? null,
        duracion_estimada:  s.tiempo_estimado_min ?? null,
        precio_cobrado:     Number(s.precio_cobrado)  || 0,
        precio_estimado:    Number(s.precio_estimado) || 0,
        precio_adicionales: Number(s.precio_adicionales) || 0,
        metodo_pago:        s.metodo_pago        ?? null,
        trabajador_nombre:  s.trabajador_nombre  ?? null,
        adicionales: (s.adicionales ?? [])
          .map((a: any) => ({ 
            nombre: a.nombre ?? a.name ?? a,
            tipo:   a.tipo   ?? "tecnica",
            precio: a.precio_base ?? 0,
          })),
        fecha: s.fin?.toDate
          ? s.fin.toDate().toISOString().split("T")[0]
          : null,
      };
    });
  },

  async calcularTipo(clienteId: string) {
    const snap = await db.collection("sesiones")
      .where("cliente_id", "==", clienteId)
      .where("estado", "==", "finalizado")
      .get();

    const registros = snap.docs.map((d: any) => d.data());
    const sesiones_total = registros.length;
    const gasto_total = registros.reduce(
      (s: number, r: any) => s + (Number(r.precio_cobrado) || 0), 0
    );

    // Frecuente = 3+ visitas este mes
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const esteMes = registros.filter((r: any) => {
      if (!r.fin) return false;
      const fecha = r.fin.toDate ? r.fin.toDate() : new Date(r.fin);
      return fecha >= inicioMes;
    });
    const tipo = esteMes.length >= 3 ? "frecuente" : "nuevo";

    // Última visita
    const ordenados = registros
      .filter((r: any) => r.fin)
      .sort((a: any, b: any) => {
        const fa = a.fin.toDate ? a.fin.toDate() : new Date(a.fin);
        const fb = b.fin.toDate ? b.fin.toDate() : new Date(b.fin);
        return fb.getTime() - fa.getTime();
      });

    const ultima_visita = ordenados.length > 0
      ? ordenados[0].fin.toDate().toISOString().split("T")[0]
      : null;

    return { tipo, sesiones_total, gasto_total, ultima_visita };
  },
};