import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = async () => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

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
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users`, { headers });
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};

export const getUserPermissions = async (userId: string): Promise<UserPermission | null> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/user-permissions/${userId}`, { headers });
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};

export const updateUserPermissions = async (userId: string, email: string, modules: Record<string, boolean>, displayName?: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/user-permissions/${userId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ email, modules, displayName }),
  });
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
};
