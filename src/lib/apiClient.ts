import { getAuth } from "firebase/auth";

export async function authFetch(url: string, options?: RequestInit) {
  const user = getAuth().currentUser;
  
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  
  const token = await user.getIdToken();
  
  return fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    }
  });
}
