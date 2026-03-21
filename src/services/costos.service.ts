const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) ?? 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

export const getResumen = async () => {
  const res = await fetch(`${API_URL}/costos/resumen`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const getMetaMensual = async () => {
  const res = await fetch(`${API_URL}/costos/meta-mensual`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const updateMetaMensual = async (payload: any) => {
  const res = await fetch(`${API_URL}/costos/meta-mensual`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

// COSTOS FIJOS
export const getCostosFijos = async () => {
  const res = await fetch(`${API_URL}/costos-fijos`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return { items: data.data, meta: data.meta };
};

export const createCostoFijo = async (payload: any) => {
  const res = await fetch(`${API_URL}/costos-fijos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const updateCostoFijo = async (id: string, payload: any) => {
  const res = await fetch(`${API_URL}/costos-fijos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const deleteCostoFijo = async (id: string) => {
  const res = await fetch(`${API_URL}/costos-fijos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

// FONDOS AHORRO
export const getFondosAhorro = async () => {
  const res = await fetch(`${API_URL}/fondos-ahorro`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return { items: data.data, meta: data.meta };
};

export const createFondoAhorro = async (payload: any) => {
  const res = await fetch(`${API_URL}/fondos-ahorro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const updateFondoAhorro = async (id: string, payload: any) => {
  const res = await fetch(`${API_URL}/fondos-ahorro/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const deleteFondoAhorro = async (id: string) => {
  const res = await fetch(`${API_URL}/fondos-ahorro/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

// TIPOS GASTO
export const getTiposGasto = async () => {
  const res = await fetch(`${API_URL}/tipos-gasto`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const createTipoGasto = async (payload: { nombre: string; color: string }) => {
  const res = await fetch(`${API_URL}/tipos-gasto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const updateTipoGasto = async (id: string, payload: { nombre?: string; color?: string }) => {
  const res = await fetch(`${API_URL}/tipos-gasto/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};

export const deleteTipoGasto = async (id: string) => {
  const res = await fetch(`${API_URL}/tipos-gasto/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.status === 0) throw new Error(data.message);
  return data.data;
};
