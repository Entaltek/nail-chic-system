import { authFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TeamMember {
  id: string;
  ownerId: string;
  name: string;
  role: string;
  commissionPercentage: number | null;
  isActive: boolean;
  createdAt: any; // Firebase Timestamp or ISO string
  updatedAt: any;
}

export const teamMemberService = {
  async getAll(): Promise<TeamMember[]> {
    const response = await authFetch(`${API_BASE_URL}/team-members`);
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
    return result.data;
  },

  async create(data: Partial<TeamMember>): Promise<string> {
    const response = await authFetch(`${API_BASE_URL}/team-members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
    return result.data.id;
  },

  async update(id: string, data: Partial<TeamMember>): Promise<void> {
    const response = await authFetch(`${API_BASE_URL}/team-members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
  },

  async delete(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE_URL}/team-members/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.status === 0) throw new Error(result.message);
  },
};
