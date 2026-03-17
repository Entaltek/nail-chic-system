import { ServiceRecordRepository } from "./serviceRecord.repository";
import { ServiceRecord } from "./serviceRecord.model";
import { Timestamp } from "firebase-admin/firestore";

export const serviceRecordService = {
  async getAll(ownerId: string): Promise<ServiceRecord[]> {
    return ServiceRecordRepository.findByOwnerId(ownerId);
  },

  async getById(id: string, ownerId: string): Promise<ServiceRecord> {
    const record = await ServiceRecordRepository.findById(id);
    if (!record) {
      throw new Error("El registro de servicio no existe");
    }
    if (record.ownerId !== ownerId) {
      throw new Error("No tienes acceso a este registro de servicio");
    }
    return record;
  },

  async getByClient(clientId: string, ownerId: string): Promise<ServiceRecord[]> {
    return ServiceRecordRepository.findByClient(ownerId, clientId);
  },

  async create(data: Partial<ServiceRecord>, ownerId: string): Promise<string> {
    // Validaciones básicas
    if (!data.serviceId || !data.serviceName) throw new Error("Datos del servicio requeridos");
    if (!data.performedById || !data.performedByName) throw new Error("Datos de quien realiza el servicio requeridos");
    if (!data.startedAt || !data.finishedAt) throw new Error("Tiempos de inicio y fin requeridos");

    // Convert string dates to Firebase Timestamps if they are passed as strings from the client
    let startTimestamp: Timestamp;
    let finishTimestamp: Timestamp;

    // Typescript might complain if we try to access .toDate() on a string, so we check
    if (typeof data.startedAt === 'string' || data.startedAt instanceof Date) {
        startTimestamp = Timestamp.fromDate(new Date(data.startedAt));
    } else if ('toDate' in (data.startedAt as any)) {
        startTimestamp = data.startedAt as Timestamp;
    } else if (data.startedAt && typeof (data.startedAt as any)._seconds === 'number') {
        const anyStart = data.startedAt as any;
        startTimestamp = new Timestamp(anyStart._seconds, anyStart._nanoseconds);
    } else {
        throw new Error("Formato de fecha de inicio inválido");
    }

    if (typeof data.finishedAt === 'string' || data.finishedAt instanceof Date) {
        finishTimestamp = Timestamp.fromDate(new Date(data.finishedAt));
    } else if ('toDate' in (data.finishedAt as any)) {
        finishTimestamp = data.finishedAt as Timestamp;
    } else if (data.finishedAt && typeof (data.finishedAt as any)._seconds === 'number') {
        const anyFinish = data.finishedAt as any;
        finishTimestamp = new Timestamp(anyFinish._seconds, anyFinish._nanoseconds);
    } else {
        throw new Error("Formato de fecha de fin inválido");
    }

    // Calculo de duración en minutos
    const diffMs = finishTimestamp.toDate().getTime() - startTimestamp.toDate().getTime();
    if (diffMs < 0) throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    
    const durationMinutes = Math.round(diffMs / 60000);

    const newRecord: Omit<ServiceRecord, "id"> = {
      ownerId,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      performedById: data.performedById,
      performedByName: data.performedByName,
      clientId: data.clientId || null,
      clientName: data.clientName || null,
      startedAt: startTimestamp,
      finishedAt: finishTimestamp,
      durationMinutes,
      extras: data.extras || null,
      notes: data.notes || null,
      createdAt: Timestamp.now(),
    };

    return ServiceRecordRepository.create(newRecord);
  },
};
