import { authFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ServiceRecord {
  id: string;
  ownerId: string;
  serviceId: string;
  serviceName: string;
  performedById: string;
  performedByName: string;
  clientId: string | null;
  clientName: string | null;
  startedAt: string | Date; // Depending on how we pass it from UI
  finishedAt: string | Date;
  durationMinutes: number;
  extras: any | null;
  notes: string | null;
  createdAt?: any;
}

export const serviceRecordService = {
  async getAll(): Promise<ServiceRecord[]> {
    const response = await authFetch(`${API_BASE_URL}/service-records`);
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
    return result.data;
  },

  async create(data: Partial<ServiceRecord>): Promise<string> {
    const response = await authFetch(`${API_BASE_URL}/service-records`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
    return result.data.id;
  },
};
