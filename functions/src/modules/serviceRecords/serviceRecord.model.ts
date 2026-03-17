import { Timestamp } from "firebase-admin/firestore";

export interface ServiceRecord {
  id: string;
  ownerId: string;
  serviceId: string;
  serviceName: string;
  performedById: string;
  performedByName: string;
  clientId: string | null;
  clientName: string | null;
  startedAt: Timestamp;
  finishedAt: Timestamp;
  durationMinutes: number;
  extras: any | null;
  notes: string | null;
  createdAt: Timestamp;
}
