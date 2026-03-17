import { authFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

export interface UserPermission {
  userId: string;
  email: string;
  displayName?: string;
  modules: Record<string, boolean>;
}

export const getUsers = async (): Promise<AuthUser[]> => {
  const response = await authFetch(`${API_BASE_URL}/users`);
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};

export const getUserPermissions = async (userId: string): Promise<UserPermission | null> => {
  const response = await authFetch(`${API_BASE_URL}/user-permissions/${userId}`);
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};

export const updateUserPermissions = async (userId: string, email: string, modules: Record<string, boolean>, displayName?: string) => {
  const response = await authFetch(`${API_BASE_URL}/user-permissions/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ email, modules, displayName }),
  });
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};
