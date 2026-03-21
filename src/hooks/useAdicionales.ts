import { useState, useCallback } from 'react';
import { getAuth } from "firebase/auth";

const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) ?? 'https://us-central1-entaltek-manicura.cloudfunctions.net/api';

export const useAdicionales = () => {
  const [data, setData] = useState<{ meta: any, items: any[] }>({ meta: {}, items: [] });
  const [inventario, setInventario] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInv, setLoadingInv] = useState(false);

  const getToken = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return await user.getIdToken();
  };

  const fetchAdicionales = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/adicionales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const resData = await res.json();
      if (resData.status === 1) {
        setData(resData.data);
      } else {
        throw new Error(resData.message);
      }
    } catch (e: any) {
      console.error("Error cargando adicionales:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInventario = useCallback(async () => {
    setLoadingInv(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/inventory-items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const resData = await res.json();
      const rawArray = resData.data || (Array.isArray(resData) ? resData : []);
      
      const inventarioMapeado = rawArray.map((item: any) => ({
        id:        item.id,
        nombre:    item.name,
        costo:     item.purchaseCost,
        stock:     item.currentStock ?? item.stockPieces ?? 0,
        unidad:    item.contentUnit ?? 'u',
        categoria: item.category,
      }));
      setInventario(inventarioMapeado);
    } catch (e: any) {
      console.error("Error cargando inventario:", e);
    } finally {
      setLoadingInv(false);
    }
  }, []);

  const addAdicional = async (payload: any) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/adicionales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (resData.status !== 1) throw new Error(resData.message);
    await fetchAdicionales();
    return resData.data;
  };

  const updateAdicional = async (id: string, payload: any) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/adicionales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (resData.status !== 1) throw new Error(resData.message);
    await fetchAdicionales();
    return resData.data;
  };

  const removeAdicional = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/adicionales/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const resData = await res.json();
    if (resData.status !== 1) throw new Error(resData.message);
    await fetchAdicionales();
    return true;
  };

  return {
    data,
    inventario,
    loading,
    loadingInv,
    fetchAdicionales,
    fetchInventario,
    addAdicional,
    updateAdicional,
    removeAdicional
  };
};
